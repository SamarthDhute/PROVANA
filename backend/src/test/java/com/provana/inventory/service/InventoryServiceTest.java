package com.provana.inventory.service;

import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.entity.Sku;
import com.provana.catalog.repository.SkuRepository;
import com.provana.common.exception.BadRequestException;
import com.provana.common.exception.ResourceNotFoundException;
import com.provana.inventory.dto.InventoryAdjustmentRequest;
import com.provana.inventory.dto.InventoryResponse;
import com.provana.inventory.dto.StockCheckResponse;
import com.provana.inventory.entity.Inventory;
import com.provana.inventory.entity.InventoryMovement;
import com.provana.inventory.entity.InventoryStatus;
import com.provana.inventory.entity.MovementType;
import com.provana.inventory.repository.InventoryMovementRepository;
import com.provana.inventory.repository.InventoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private InventoryMovementRepository movementRepository;

    @Mock
    private SkuRepository skuRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private Sku testSku;
    private Inventory testInventory;
    private UUID skuId;

    @BeforeEach
    void setUp() {
        skuId = UUID.randomUUID();

        Product product = new Product();
        product.setName("PROVANA 100% Pure Whey Isolate");

        ProductVariant variant = new ProductVariant();
        variant.setName("Rich Chocolate 2kg");
        variant.setProduct(product);

        testSku = new Sku();
        testSku.setId(skuId);
        testSku.setSkuCode("PROV-WPI-CHOC-2KG");
        testSku.setPrice(new BigDecimal("3499.00"));
        testSku.setVariant(variant);
        testSku.setAvailable(true);

        testInventory = new Inventory(testSku, 50, 10);
        testInventory.setId(UUID.randomUUID());
    }

    @Test
    @DisplayName("Should successfully retrieve inventory by SKU ID")
    void getInventoryBySkuId_Success() {
        when(inventoryRepository.findBySkuId(skuId)).thenReturn(Optional.of(testInventory));

        InventoryResponse response = inventoryService.getInventoryBySkuId(skuId);

        assertThat(response).isNotNull();
        assertThat(response.skuCode()).isEqualTo("PROV-WPI-CHOC-2KG");
        assertThat(response.availableQuantity()).isEqualTo(50);
        assertThat(response.sellableQuantity()).isEqualTo(50);
        assertThat(response.isLowStock()).isFalse();
        assertThat(response.status()).isEqualTo(InventoryStatus.IN_STOCK);
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when SKU inventory not found")
    void getInventoryBySkuId_NotFound() {
        when(inventoryRepository.findBySkuId(skuId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> inventoryService.getInventoryBySkuId(skuId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Inventory for SKU not found");
    }

    @Test
    @DisplayName("Should adjust stock upwards and create audit movement")
    void adjustStock_PositiveAdjustment_Success() {
        when(inventoryRepository.findBySkuIdWithLock(skuId)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(skuRepository.save(any(Sku.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(
                20,
                MovementType.STOCK_RECEIVED,
                "New shipment arrival",
                "PURCHASE_ORDER",
                "PO-2026-001"
        );

        InventoryResponse response = inventoryService.adjustStock(skuId, request, "manager@provana.com");

        assertThat(response.availableQuantity()).isEqualTo(70);
        assertThat(response.sellableQuantity()).isEqualTo(70);
        verify(movementRepository).save(any(InventoryMovement.class));
    }

    @Test
    @DisplayName("Should adjust stock downwards and transition to LOW_STOCK when below threshold")
    void adjustStock_NegativeAdjustment_LowStock() {
        when(inventoryRepository.findBySkuIdWithLock(skuId)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(skuRepository.save(any(Sku.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(
                -42, // 50 - 42 = 8 (Threshold is 10)
                MovementType.MANUAL_ADJUSTMENT,
                "Audit correction",
                "MANUAL_ADJUSTMENT",
                null
        );

        InventoryResponse response = inventoryService.adjustStock(skuId, request, "manager@provana.com");

        assertThat(response.availableQuantity()).isEqualTo(8);
        assertThat(response.sellableQuantity()).isEqualTo(8);
        assertThat(response.isLowStock()).isTrue();
        assertThat(response.status()).isEqualTo(InventoryStatus.LOW_STOCK);
    }

    @Test
    @DisplayName("Should reject negative stock adjustment causing stock < 0")
    void adjustStock_RejectNegativeStock() {
        when(inventoryRepository.findBySkuIdWithLock(skuId)).thenReturn(Optional.of(testInventory));

        InventoryAdjustmentRequest request = new InventoryAdjustmentRequest(
                -60, // 50 - 60 = -10 (Forbidden)
                MovementType.MANUAL_ADJUSTMENT,
                "Invalid deduction",
                null,
                null
        );

        assertThatThrownBy(() -> inventoryService.adjustStock(skuId, request, "manager@provana.com"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("cannot be negative");

        verify(movementRepository, never()).save(any(InventoryMovement.class));
    }

    @Test
    @DisplayName("Should successfully reserve stock for checkout order")
    void reserveStock_Success() {
        when(inventoryRepository.findBySkuIdWithLock(skuId)).thenReturn(Optional.of(testInventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InventoryResponse response = inventoryService.reserveStock(skuId, 5, "ORDER-1001", "CHECKOUT");

        assertThat(response.availableQuantity()).isEqualTo(50);
        assertThat(response.reservedQuantity()).isEqualTo(5);
        assertThat(response.sellableQuantity()).isEqualTo(45);
        verify(movementRepository).save(any(InventoryMovement.class));
    }

    @Test
    @DisplayName("Should reject reservation when requested quantity exceeds sellable stock")
    void reserveStock_InsufficientStock() {
        when(inventoryRepository.findBySkuIdWithLock(skuId)).thenReturn(Optional.of(testInventory));

        assertThatThrownBy(() -> inventoryService.reserveStock(skuId, 55, "ORDER-1002", "CHECKOUT"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Insufficient sellable stock");
    }

    @Test
    @DisplayName("Should check stock and return availability accurately")
    void checkStock_Success() {
        when(inventoryRepository.findBySkuId(skuId)).thenReturn(Optional.of(testInventory));

        StockCheckResponse response = inventoryService.checkStock(skuId);

        assertThat(response.inStock()).isTrue();
        assertThat(response.availableQuantity()).isEqualTo(50);
        assertThat(response.sellableQuantity()).isEqualTo(50);
    }
}

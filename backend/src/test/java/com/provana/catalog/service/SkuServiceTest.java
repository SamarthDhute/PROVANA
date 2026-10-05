package com.provana.catalog.service;

import com.provana.catalog.dto.SkuRequest;
import com.provana.catalog.dto.SkuResponse;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.entity.Sku;
import com.provana.catalog.repository.ProductVariantRepository;
import com.provana.catalog.repository.SkuRepository;
import com.provana.common.exception.BadRequestException;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
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
class SkuServiceTest {

    @Mock
    private SkuRepository skuRepository;

    @Mock
    private ProductVariantRepository variantRepository;

    @InjectMocks
    private SkuService skuService;

    private ProductVariant testVariant;
    private UUID variantId;

    @BeforeEach
    void setUp() {
        variantId = UUID.randomUUID();
        testVariant = new ProductVariant();
        testVariant.setId(variantId);
        testVariant.setName("Chocolate / 1kg");
    }

    @Test
    @DisplayName("Should successfully create SKU")
    void createSku_Success() {
        SkuRequest request = new SkuRequest(
                variantId,
                "PROV-WPI-CHOC-1KG",
                new BigDecimal("2899.00"),
                new BigDecimal("3499.00"),
                "INR",
                true,
                true
        );

        when(skuRepository.existsBySkuCode("PROV-WPI-CHOC-1KG")).thenReturn(false);
        when(variantRepository.findById(variantId)).thenReturn(Optional.of(testVariant));
        when(skuRepository.save(any(Sku.class))).thenAnswer(invocation -> {
            Sku s = invocation.getArgument(0);
            s.setId(UUID.randomUUID());
            return s;
        });

        SkuResponse response = skuService.createSku(request);

        assertThat(response).isNotNull();
        assertThat(response.skuCode()).isEqualTo("PROV-WPI-CHOC-1KG");
        assertThat(response.price()).isEqualByComparingTo("2899.00");
        verify(skuRepository).save(any(Sku.class));
    }

    @Test
    @DisplayName("Should reject negative price")
    void createSku_NegativePrice_ThrowsBadRequest() {
        SkuRequest request = new SkuRequest(
                variantId,
                "PROV-INVALID",
                new BigDecimal("-100.00"),
                null,
                "INR",
                true,
                true
        );

        assertThatThrownBy(() -> skuService.createSku(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("price cannot be null or negative");

        verify(skuRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate SKU code")
    void createSku_DuplicateSkuCode_ThrowsDuplicateResource() {
        SkuRequest request = new SkuRequest(
                variantId,
                "PROV-EXISTING",
                new BigDecimal("1999.00"),
                null,
                "INR",
                true,
                true
        );

        when(skuRepository.existsBySkuCode("PROV-EXISTING")).thenReturn(true);

        assertThatThrownBy(() -> skuService.createSku(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("SKU already exists with skuCode: 'PROV-EXISTING'");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when variant not found")
    void createSku_VariantNotFound() {
        SkuRequest request = new SkuRequest(
                variantId,
                "PROV-NEW",
                new BigDecimal("1999.00"),
                null,
                "INR",
                true,
                true
        );

        when(skuRepository.existsBySkuCode("PROV-NEW")).thenReturn(false);
        when(variantRepository.findById(variantId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> skuService.createSku(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ProductVariant not found with id");
    }
}

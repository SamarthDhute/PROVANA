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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
public class SkuService {

    private final SkuRepository skuRepository;
    private final ProductVariantRepository variantRepository;
    private final com.provana.inventory.repository.InventoryRepository inventoryRepository;

    public SkuService(SkuRepository skuRepository,
                      ProductVariantRepository variantRepository,
                      com.provana.inventory.repository.InventoryRepository inventoryRepository) {
        this.skuRepository = skuRepository;
        this.variantRepository = variantRepository;
        this.inventoryRepository = inventoryRepository;
    }

    @Transactional(readOnly = true)
    public SkuResponse getSkuById(UUID id) {
        Sku sku = skuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SKU", "id", id));
        return mapToResponse(sku);
    }

    @Transactional(readOnly = true)
    public SkuResponse getSkuByCode(String skuCode) {
        Sku sku = skuRepository.findBySkuCode(skuCode)
                .orElseThrow(() -> new ResourceNotFoundException("SKU", "skuCode", skuCode));
        return mapToResponse(sku);
    }

    @Transactional(readOnly = true)
    public List<SkuResponse> getSkusByVariantId(UUID variantId) {
        return skuRepository.findByVariantId(variantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public SkuResponse createSku(SkuRequest request) {
        validatePrice(request.price(), request.compareAtPrice());

        if (skuRepository.existsBySkuCode(request.skuCode())) {
            throw new DuplicateResourceException("SKU", "skuCode", request.skuCode());
        }

        ProductVariant variant = variantRepository.findById(request.variantId())
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.variantId()));

        Sku sku = new Sku();
        sku.setVariant(variant);
        sku.setSkuCode(request.skuCode().trim().toUpperCase());
        sku.setPrice(request.price());
        sku.setCompareAtPrice(request.compareAtPrice());
        if (request.currency() != null) {
            sku.setCurrency(request.currency().toUpperCase());
        }
        if (request.available() != null) {
            sku.setAvailable(request.available());
        }
        if (request.active() != null) {
            sku.setActive(request.active());
        }

        Sku saved = skuRepository.save(sku);

        if (!inventoryRepository.existsBySkuId(saved.getId())) {
            com.provana.inventory.entity.Inventory inventory = new com.provana.inventory.entity.Inventory(saved, 100, 5);
            inventoryRepository.save(inventory);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public SkuResponse updateSku(UUID id, SkuRequest request) {
        validatePrice(request.price(), request.compareAtPrice());

        Sku sku = skuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SKU", "id", id));

        if (skuRepository.existsBySkuCodeAndIdNot(request.skuCode(), id)) {
            throw new DuplicateResourceException("SKU", "skuCode", request.skuCode());
        }

        if (!sku.getVariant().getId().equals(request.variantId())) {
            ProductVariant variant = variantRepository.findById(request.variantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.variantId()));
            sku.setVariant(variant);
        }

        sku.setSkuCode(request.skuCode().trim().toUpperCase());
        sku.setPrice(request.price());
        sku.setCompareAtPrice(request.compareAtPrice());
        if (request.currency() != null) {
            sku.setCurrency(request.currency().toUpperCase());
        }
        if (request.available() != null) {
            sku.setAvailable(request.available());
        }
        if (request.active() != null) {
            sku.setActive(request.active());
        }

        Sku updated = skuRepository.save(sku);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteSku(UUID id) {
        Sku sku = skuRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("SKU", "id", id));
        // Soft deactivate to protect historical orders and inventory
        sku.setActive(false);
        sku.setAvailable(false);
        skuRepository.save(sku);
    }

    private void validatePrice(BigDecimal price, BigDecimal compareAtPrice) {
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("SKU price cannot be null or negative");
        }
        if (compareAtPrice != null && compareAtPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("SKU compareAtPrice cannot be negative");
        }
    }

    public SkuResponse mapToResponse(Sku sku) {
        return new SkuResponse(
                sku.getId(),
                sku.getVariant().getId(),
                sku.getSkuCode(),
                sku.getPrice(),
                sku.getCompareAtPrice(),
                sku.getCurrency(),
                sku.getAvailable(),
                sku.getActive()
        );
    }
}

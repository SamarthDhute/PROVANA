package com.provana.catalog.service;

import com.provana.catalog.dto.VariantRequest;
import com.provana.catalog.dto.VariantResponse;
import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.repository.ProductRepository;
import com.provana.catalog.repository.ProductVariantRepository;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductVariantService {

    private final ProductVariantRepository variantRepository;
    private final ProductRepository productRepository;
    private final SkuService skuService;

    public ProductVariantService(ProductVariantRepository variantRepository,
                                 ProductRepository productRepository,
                                 SkuService skuService) {
        this.variantRepository = variantRepository;
        this.productRepository = productRepository;
        this.skuService = skuService;
    }

    @Transactional(readOnly = true)
    public List<VariantResponse> getVariantsByProductId(UUID productId, boolean activeOnly) {
        List<ProductVariant> variants = activeOnly
                ? variantRepository.findByProductIdAndActiveTrueOrderBySortOrderAsc(productId)
                : variantRepository.findByProductIdOrderBySortOrderAsc(productId);

        return variants.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public VariantResponse getVariantById(UUID id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
        return mapToResponse(variant);
    }

    @Transactional
    public VariantResponse createVariant(VariantRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId()));

        ProductVariant variant = new ProductVariant();
        variant.setProduct(product);
        variant.setName(request.name());
        variant.setFlavor(request.flavor());
        variant.setSize(request.size());
        variant.setAttributesJson(request.attributesJson());
        if (request.active() != null) {
            variant.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            variant.setSortOrder(request.sortOrder());
        }

        ProductVariant saved = variantRepository.save(variant);
        return mapToResponse(saved);
    }

    @Transactional
    public VariantResponse updateVariant(UUID id, VariantRequest request) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));

        variant.setName(request.name());
        variant.setFlavor(request.flavor());
        variant.setSize(request.size());
        variant.setAttributesJson(request.attributesJson());
        if (request.active() != null) {
            variant.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            variant.setSortOrder(request.sortOrder());
        }

        ProductVariant updated = variantRepository.save(variant);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteVariant(UUID id) {
        ProductVariant variant = variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
        variant.setActive(false);
        variantRepository.save(variant);
    }

    public VariantResponse mapToResponse(ProductVariant variant) {
        var skus = variant.getSkus() == null ? List.<com.provana.catalog.dto.SkuResponse>of() :
                variant.getSkus().stream()
                        .filter(s -> Boolean.TRUE.equals(s.getActive()))
                        .map(skuService::mapToResponse)
                        .toList();

        return new VariantResponse(
                variant.getId(),
                variant.getProduct().getId(),
                variant.getName(),
                variant.getFlavor(),
                variant.getSize(),
                variant.getAttributesJson(),
                variant.getActive(),
                variant.getSortOrder(),
                skus
        );
    }
}

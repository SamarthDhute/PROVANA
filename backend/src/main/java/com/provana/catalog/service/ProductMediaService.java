package com.provana.catalog.service;

import com.provana.catalog.dto.ProductMediaRequest;
import com.provana.catalog.dto.ProductMediaResponse;
import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductMedia;
import com.provana.catalog.entity.ProductVariant;
import com.provana.catalog.repository.ProductMediaRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.catalog.repository.ProductVariantRepository;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ProductMediaService {

    private final ProductMediaRepository mediaRepository;
    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;

    public ProductMediaService(ProductMediaRepository mediaRepository,
                               ProductRepository productRepository,
                               ProductVariantRepository variantRepository) {
        this.mediaRepository = mediaRepository;
        this.productRepository = productRepository;
        this.variantRepository = variantRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductMediaResponse> getMediaByProductId(UUID productId, boolean activeOnly) {
        List<ProductMedia> mediaList = activeOnly
                ? mediaRepository.findByProductIdAndActiveTrueOrderBySortOrderAsc(productId)
                : mediaRepository.findByProductIdOrderBySortOrderAsc(productId);

        return mediaList.stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public ProductMediaResponse addMedia(ProductMediaRequest request) {
        Product product = productRepository.findById(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.productId()));

        ProductVariant variant = null;
        if (request.variantId() != null) {
            variant = variantRepository.findById(request.variantId())
                    .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", request.variantId()));
        }

        ProductMedia media = new ProductMedia();
        media.setProduct(product);
        media.setVariant(variant);
        if (request.mediaType() != null) {
            media.setMediaType(request.mediaType().toUpperCase());
        }
        media.setUrl(request.url());
        media.setAltText(request.altText());
        if (request.isPrimary() != null) {
            media.setIsPrimary(request.isPrimary());
        }
        if (request.sortOrder() != null) {
            media.setSortOrder(request.sortOrder());
        }
        if (request.active() != null) {
            media.setActive(request.active());
        }

        ProductMedia saved = mediaRepository.save(media);
        return mapToResponse(saved);
    }

    @Transactional
    public void deleteMedia(UUID id) {
        ProductMedia media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductMedia", "id", id));
        mediaRepository.delete(media);
    }

    public ProductMediaResponse mapToResponse(ProductMedia media) {
        return new ProductMediaResponse(
                media.getId(),
                media.getProduct().getId(),
                media.getVariant() != null ? media.getVariant().getId() : null,
                media.getMediaType(),
                media.getUrl(),
                media.getAltText(),
                media.getIsPrimary(),
                media.getSortOrder(),
                media.getActive()
        );
    }
}

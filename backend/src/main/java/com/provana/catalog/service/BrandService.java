package com.provana.catalog.service;

import com.provana.catalog.dto.BrandRequest;
import com.provana.catalog.dto.BrandResponse;
import com.provana.catalog.entity.Brand;
import com.provana.catalog.repository.BrandRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final ProductRepository productRepository;

    public BrandService(BrandRepository brandRepository, ProductRepository productRepository) {
        this.brandRepository = brandRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<BrandResponse> getActiveBrands() {
        return brandRepository.findAllByActiveTrueOrderByNameAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandBySlug(String slug) {
        Brand brand = brandRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "slug", slug));
        return mapToResponse(brand);
    }

    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BrandResponse getBrandById(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));
        return mapToResponse(brand);
    }

    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Brand", "slug", request.slug());
        }

        Brand brand = new Brand();
        brand.setName(request.name());
        brand.setSlug(request.slug().toLowerCase().trim());
        brand.setDescription(request.description());
        brand.setLogoUrl(request.logoUrl());
        if (request.active() != null) {
            brand.setActive(request.active());
        }

        Brand saved = brandRepository.save(brand);
        return mapToResponse(saved);
    }

    @Transactional
    public BrandResponse updateBrand(UUID id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        if (brandRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new DuplicateResourceException("Brand", "slug", request.slug());
        }

        brand.setName(request.name());
        brand.setSlug(request.slug().toLowerCase().trim());
        brand.setDescription(request.description());
        brand.setLogoUrl(request.logoUrl());
        if (request.active() != null) {
            brand.setActive(request.active());
        }

        Brand updated = brandRepository.save(brand);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteBrand(UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Brand", "id", id));

        long productCount = productRepository.countByBrandId(id);
        if (productCount > 0) {
            brand.setActive(false);
            brandRepository.save(brand);
            return;
        }

        brandRepository.delete(brand);
    }

    public BrandResponse mapToResponse(Brand brand) {
        return new BrandResponse(
                brand.getId(),
                brand.getName(),
                brand.getSlug(),
                brand.getDescription(),
                brand.getLogoUrl(),
                brand.getActive(),
                brand.getCreatedAt(),
                brand.getUpdatedAt()
        );
    }
}

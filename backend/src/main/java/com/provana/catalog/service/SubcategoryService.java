package com.provana.catalog.service;

import com.provana.catalog.dto.SubcategoryRequest;
import com.provana.catalog.dto.SubcategoryResponse;
import com.provana.catalog.entity.Category;
import com.provana.catalog.entity.Subcategory;
import com.provana.catalog.repository.CategoryRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.catalog.repository.SubcategoryRepository;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class SubcategoryService {

    private final SubcategoryRepository subcategoryRepository;
    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public SubcategoryService(SubcategoryRepository subcategoryRepository,
                              CategoryRepository categoryRepository,
                              ProductRepository productRepository) {
        this.subcategoryRepository = subcategoryRepository;
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<SubcategoryResponse> getActiveSubcategories(UUID categoryId) {
        if (categoryId != null) {
            return subcategoryRepository.findAllByCategoryIdAndActiveTrueOrderBySortOrderAsc(categoryId)
                    .stream()
                    .map(this::mapToResponse)
                    .toList();
        }
        return subcategoryRepository.findAllByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubcategoryResponse getSubcategoryBySlug(String slug) {
        Subcategory subcategory = subcategoryRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "slug", slug));
        return mapToResponse(subcategory);
    }

    @Transactional(readOnly = true)
    public List<SubcategoryResponse> getAllSubcategories() {
        return subcategoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public SubcategoryResponse getSubcategoryById(UUID id) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", id));
        return mapToResponse(subcategory);
    }

    @Transactional
    public SubcategoryResponse createSubcategory(SubcategoryRequest request) {
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (subcategoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Subcategory", "slug", request.slug());
        }

        Subcategory subcategory = new Subcategory();
        subcategory.setCategory(category);
        subcategory.setName(request.name());
        subcategory.setSlug(request.slug().toLowerCase().trim());
        subcategory.setDescription(request.description());
        if (request.active() != null) {
            subcategory.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            subcategory.setSortOrder(request.sortOrder());
        }

        Subcategory saved = subcategoryRepository.save(subcategory);
        return mapToResponse(saved);
    }

    @Transactional
    public SubcategoryResponse updateSubcategory(UUID id, SubcategoryRequest request) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", id));

        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", request.categoryId()));

        if (subcategoryRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new DuplicateResourceException("Subcategory", "slug", request.slug());
        }

        subcategory.setCategory(category);
        subcategory.setName(request.name());
        subcategory.setSlug(request.slug().toLowerCase().trim());
        subcategory.setDescription(request.description());
        if (request.active() != null) {
            subcategory.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            subcategory.setSortOrder(request.sortOrder());
        }

        Subcategory updated = subcategoryRepository.save(subcategory);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteSubcategory(UUID id) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subcategory", "id", id));

        long productCount = productRepository.countBySubcategoryId(id);
        if (productCount > 0) {
            subcategory.setActive(false);
            subcategoryRepository.save(subcategory);
            return;
        }

        subcategoryRepository.delete(subcategory);
    }

    public SubcategoryResponse mapToResponse(Subcategory subcategory) {
        return new SubcategoryResponse(
                subcategory.getId(),
                subcategory.getCategory().getId(),
                subcategory.getCategory().getName(),
                subcategory.getName(),
                subcategory.getSlug(),
                subcategory.getDescription(),
                subcategory.getActive(),
                subcategory.getSortOrder(),
                subcategory.getCreatedAt(),
                subcategory.getUpdatedAt()
        );
    }
}

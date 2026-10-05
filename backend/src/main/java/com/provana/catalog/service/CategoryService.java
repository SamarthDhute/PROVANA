package com.provana.catalog.service;

import com.provana.catalog.dto.CategoryRequest;
import com.provana.catalog.dto.CategoryResponse;
import com.provana.catalog.entity.Category;
import com.provana.catalog.repository.CategoryRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.common.exception.BusinessRuleViolationException;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public CategoryService(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getActiveCategories() {
        return categoryRepository.findAllByActiveTrueOrderBySortOrderAsc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryBySlug(String slug) {
        Category category = categoryRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "slug", slug));
        return mapToResponse(category);
    }

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));
        return mapToResponse(category);
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsBySlug(request.slug())) {
            throw new DuplicateResourceException("Category", "slug", request.slug());
        }

        Category category = new Category();
        category.setName(request.name());
        category.setSlug(request.slug().toLowerCase().trim());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        if (request.active() != null) {
            category.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        Category saved = categoryRepository.save(category);
        return mapToResponse(saved);
    }

    @Transactional
    public CategoryResponse updateCategory(UUID id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        if (categoryRepository.existsBySlugAndIdNot(request.slug(), id)) {
            throw new DuplicateResourceException("Category", "slug", request.slug());
        }

        category.setName(request.name());
        category.setSlug(request.slug().toLowerCase().trim());
        category.setDescription(request.description());
        category.setImageUrl(request.imageUrl());
        if (request.active() != null) {
            category.setActive(request.active());
        }
        if (request.sortOrder() != null) {
            category.setSortOrder(request.sortOrder());
        }

        Category updated = categoryRepository.save(category);
        return mapToResponse(updated);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", "id", id));

        long productCount = productRepository.countByCategoryId(id);
        if (productCount > 0) {
            // Business rule: controlled deactivation rather than corrupting catalog hierarchy
            category.setActive(false);
            categoryRepository.save(category);
            return;
        }

        categoryRepository.delete(category);
    }

    public CategoryResponse mapToResponse(Category category) {
        return new CategoryResponse(
                category.getId(),
                category.getName(),
                category.getSlug(),
                category.getDescription(),
                category.getImageUrl(),
                category.getActive(),
                category.getSortOrder(),
                category.getCreatedAt(),
                category.getUpdatedAt()
        );
    }
}

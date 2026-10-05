package com.provana.catalog.service;

import com.provana.catalog.dto.CategoryRequest;
import com.provana.catalog.dto.CategoryResponse;
import com.provana.catalog.entity.Category;
import com.provana.catalog.repository.CategoryRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.common.exception.DuplicateResourceException;
import com.provana.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CategoryService categoryService;

    private Category testCategory;
    private UUID categoryId;

    @BeforeEach
    void setUp() {
        categoryId = UUID.randomUUID();
        testCategory = new Category();
        testCategory.setId(categoryId);
        testCategory.setName("Protein");
        testCategory.setSlug("protein");
        testCategory.setActive(true);
        testCategory.setSortOrder(1);
    }

    @Test
    @DisplayName("Should successfully create a category")
    void createCategory_Success() {
        CategoryRequest request = new CategoryRequest("Performance", "performance", "Boost athletic stamina", null, true, 2);

        when(categoryRepository.existsBySlug("performance")).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category c = invocation.getArgument(0);
            c.setId(UUID.randomUUID());
            return c;
        });

        CategoryResponse response = categoryService.createCategory(request);

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Performance");
        assertThat(response.slug()).isEqualTo("performance");
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException on existing slug")
    void createCategory_DuplicateSlug() {
        CategoryRequest request = new CategoryRequest("Protein", "protein", null, null, true, 1);
        when(categoryRepository.existsBySlug("protein")).thenReturn(true);

        assertThatThrownBy(() -> categoryService.createCategory(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Category already exists with slug: 'protein'");

        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should retrieve category by slug")
    void getCategoryBySlug_Success() {
        when(categoryRepository.findBySlugAndActiveTrue("protein")).thenReturn(Optional.of(testCategory));

        CategoryResponse response = categoryService.getCategoryBySlug("protein");

        assertThat(response).isNotNull();
        assertThat(response.slug()).isEqualTo("protein");
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when slug not found")
    void getCategoryBySlug_NotFound() {
        when(categoryRepository.findBySlugAndActiveTrue("non-existent")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> categoryService.getCategoryBySlug("non-existent"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Category not found with slug: 'non-existent'");
    }

    @Test
    @DisplayName("Should safely deactivate category when referenced by products")
    void deleteCategory_ReferencedByProducts_DeactivatesSafely() {
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(productRepository.countByCategoryId(categoryId)).thenReturn(5L);

        categoryService.deleteCategory(categoryId);

        assertThat(testCategory.isActive()).isFalse();
        verify(categoryRepository).save(testCategory);
        verify(categoryRepository, never()).delete(any());
    }
}

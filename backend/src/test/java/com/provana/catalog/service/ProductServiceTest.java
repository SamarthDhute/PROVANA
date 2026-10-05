package com.provana.catalog.service;

import com.provana.catalog.dto.CreateProductRequest;
import com.provana.catalog.dto.ProductDetailResponse;
import com.provana.catalog.entity.Brand;
import com.provana.catalog.entity.Category;
import com.provana.catalog.entity.Product;
import com.provana.catalog.entity.ProductStatus;
import com.provana.catalog.entity.Subcategory;
import com.provana.catalog.repository.BrandRepository;
import com.provana.catalog.repository.CategoryRepository;
import com.provana.catalog.repository.ProductRepository;
import com.provana.catalog.repository.SubcategoryRepository;
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

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BrandRepository brandRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private SubcategoryRepository subcategoryRepository;

    @Mock
    private BrandService brandService;

    @Mock
    private CategoryService categoryService;

    @Mock
    private SubcategoryService subcategoryService;

    @Mock
    private ProductVariantService variantService;

    @Mock
    private ProductMediaService mediaService;

    @Mock
    private ProductNutritionService nutritionService;

    @Mock
    private ProductFaqService faqService;

    @InjectMocks
    private ProductService productService;

    private Brand brand;
    private Category category;
    private Subcategory subcategory;
    private Product publishedProduct;

    @BeforeEach
    void setUp() {
        brand = new Brand();
        brand.setId(UUID.randomUUID());
        brand.setName("PROVANA");
        brand.setSlug("provana");

        category = new Category();
        category.setId(UUID.randomUUID());
        category.setName("Protein");
        category.setSlug("protein");

        subcategory = new Subcategory();
        subcategory.setId(UUID.randomUUID());
        subcategory.setName("Whey Protein");
        subcategory.setSlug("whey-protein");
        subcategory.setCategory(category);

        publishedProduct = new Product();
        publishedProduct.setId(UUID.randomUUID());
        publishedProduct.setName("Provana 100% Pure Whey Isolate");
        publishedProduct.setSlug("provana-100-pure-whey-isolate");
        publishedProduct.setBrand(brand);
        publishedProduct.setCategory(category);
        publishedProduct.setSubcategory(subcategory);
        publishedProduct.setStatus(ProductStatus.PUBLISHED);
    }

    @Test
    @DisplayName("Customer cannot view unpublished/draft products")
    void getCustomerProductBySlug_Unpublished_ThrowsNotFound() {
        when(productRepository.findBySlugAndStatus("draft-product", ProductStatus.PUBLISHED))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> productService.getCustomerProductBySlug("draft-product"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Product not found with slug: 'draft-product'");
    }

    @Test
    @DisplayName("Customer gets complete product detail for published product")
    void getCustomerProductBySlug_Published_Success() {
        when(productRepository.findBySlugAndStatus("provana-100-pure-whey-isolate", ProductStatus.PUBLISHED))
                .thenReturn(Optional.of(publishedProduct));
        when(variantService.getVariantsByProductId(publishedProduct.getId(), true))
                .thenReturn(Collections.emptyList());
        when(mediaService.getMediaByProductId(publishedProduct.getId(), true))
                .thenReturn(Collections.emptyList());
        when(faqService.getFaqsByProductId(publishedProduct.getId(), true))
                .thenReturn(Collections.emptyList());

        ProductDetailResponse response = productService.getCustomerProductBySlug("provana-100-pure-whey-isolate");

        assertThat(response).isNotNull();
        assertThat(response.name()).isEqualTo("Provana 100% Pure Whey Isolate");
        assertThat(response.status()).isEqualTo(ProductStatus.PUBLISHED);
    }

    @Test
    @DisplayName("Should prevent category/subcategory mismatch when creating product")
    void createProduct_MismatchedSubcategory_ThrowsBadRequest() {
        Category otherCategory = new Category();
        otherCategory.setId(UUID.randomUUID());
        otherCategory.setName("Vitamins");

        Subcategory mismatchedSubcategory = new Subcategory();
        mismatchedSubcategory.setId(UUID.randomUUID());
        mismatchedSubcategory.setName("Multivitamins");
        mismatchedSubcategory.setCategory(otherCategory); // Belongs to Vitamins, not Protein!

        CreateProductRequest request = new CreateProductRequest(
                "Provana Invalid Product",
                "provana-invalid",
                brand.getId(),
                category.getId(),
                mismatchedSubcategory.getId(),
                null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        when(productRepository.existsBySlug("provana-invalid")).thenReturn(false);
        when(brandRepository.findById(brand.getId())).thenReturn(Optional.of(brand));
        when(categoryRepository.findById(category.getId())).thenReturn(Optional.of(category));
        when(subcategoryRepository.findById(mismatchedSubcategory.getId())).thenReturn(Optional.of(mismatchedSubcategory));

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("does not belong to Category");

        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate product slug")
    void createProduct_DuplicateSlug_ThrowsDuplicateResource() {
        CreateProductRequest request = new CreateProductRequest(
                "Duplicate", "provana-100-pure-whey-isolate",
                brand.getId(), category.getId(), null, null, null, null, null, null, null, null, null, null,
                ProductStatus.DRAFT, null, null
        );

        when(productRepository.existsBySlug("provana-100-pure-whey-isolate")).thenReturn(true);

        assertThatThrownBy(() -> productService.createProduct(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Product already exists with slug");
    }
}

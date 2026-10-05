package com.provana.catalog.controller;

import com.provana.catalog.dto.CategoryResponse;
import com.provana.catalog.dto.ProductSummaryResponse;
import com.provana.catalog.dto.SubcategoryResponse;
import com.provana.catalog.service.CategoryService;
import com.provana.catalog.service.ProductService;
import com.provana.catalog.service.SubcategoryService;
import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
@Tag(name = "Customer Catalogue: Categories", description = "Public endpoints to browse product categories")
public class CategoryController {

    private final CategoryService categoryService;
    private final SubcategoryService subcategoryService;
    private final ProductService productService;

    public CategoryController(CategoryService categoryService,
                              SubcategoryService subcategoryService,
                              ProductService productService) {
        this.categoryService = categoryService;
        this.subcategoryService = subcategoryService;
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "List all active categories", description = "Returns active categories sorted by display order")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getActiveCategories()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get category by slug", description = "Returns active category details for navigation and headers")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryBySlug(slug)));
    }

    @GetMapping("/{slug}/subcategories")
    @Operation(summary = "List active subcategories under category", description = "Returns subcategories belonging to this category")
    public ResponseEntity<ApiResponse<List<SubcategoryResponse>>> getSubcategoriesByCategory(@PathVariable String slug) {
        CategoryResponse category = categoryService.getCategoryBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getActiveSubcategories(category.id())));
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "List products by category", description = "Returns paginated published products under this category")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getProductsByCategory(
            @PathVariable String slug,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.listCustomerProducts(slug, null, null, null, null, pageable)
        ));
    }
}

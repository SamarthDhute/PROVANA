package com.provana.catalog.controller;

import com.provana.catalog.dto.ProductSummaryResponse;
import com.provana.catalog.dto.SubcategoryResponse;
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
@RequestMapping("/api/v1/subcategories")
@Tag(name = "Customer Catalogue: Subcategories", description = "Public endpoints to browse product subcategories")
public class SubcategoryController {

    private final SubcategoryService subcategoryService;
    private final ProductService productService;

    public SubcategoryController(SubcategoryService subcategoryService, ProductService productService) {
        this.subcategoryService = subcategoryService;
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "List all active subcategories", description = "Returns all active subcategories")
    public ResponseEntity<ApiResponse<List<SubcategoryResponse>>> getSubcategories() {
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getActiveSubcategories(null)));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get subcategory by slug", description = "Returns active subcategory details")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> getSubcategoryBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getSubcategoryBySlug(slug)));
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "List products by subcategory", description = "Returns paginated published products under this subcategory")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getProductsBySubcategory(
            @PathVariable String slug,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.listCustomerProducts(null, slug, null, null, null, pageable)
        ));
    }
}

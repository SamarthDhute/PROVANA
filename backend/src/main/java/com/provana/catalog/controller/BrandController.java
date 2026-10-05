package com.provana.catalog.controller;

import com.provana.catalog.dto.BrandResponse;
import com.provana.catalog.dto.ProductSummaryResponse;
import com.provana.catalog.service.BrandService;
import com.provana.catalog.service.ProductService;
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
@RequestMapping("/api/v1/brands")
@Tag(name = "Customer Catalogue: Brands", description = "Public endpoints to browse brands")
public class BrandController {

    private final BrandService brandService;
    private final ProductService productService;

    public BrandController(BrandService brandService, ProductService productService) {
        this.brandService = brandService;
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "List all active brands", description = "Returns active brands")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getBrands() {
        return ResponseEntity.ok(ApiResponse.ok(brandService.getActiveBrands()));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get brand by slug", description = "Returns brand profile details")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(ApiResponse.ok(brandService.getBrandBySlug(slug)));
    }

    @GetMapping("/{slug}/products")
    @Operation(summary = "List products by brand", description = "Returns paginated published products for this brand")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> getProductsByBrand(
            @PathVariable String slug,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.ok(
                productService.listCustomerProducts(null, null, slug, null, null, pageable)
        ));
    }
}

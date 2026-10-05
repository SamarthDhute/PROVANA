package com.provana.catalog.controller;

import com.provana.catalog.dto.*;
import com.provana.catalog.service.*;
import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/products")
@Tag(name = "Customer Catalogue: Products", description = "Public endpoints for customer product discovery and PDP")
public class ProductController {

    private final ProductService productService;
    private final ProductVariantService variantService;
    private final ProductMediaService mediaService;
    private final ProductNutritionService nutritionService;
    private final ProductFaqService faqService;

    public ProductController(ProductService productService,
                             ProductVariantService variantService,
                             ProductMediaService mediaService,
                             ProductNutritionService nutritionService,
                             ProductFaqService faqService) {
        this.productService = productService;
        this.variantService = variantService;
        this.mediaService = mediaService;
        this.nutritionService = nutritionService;
        this.faqService = faqService;
    }

    @GetMapping
    @Operation(summary = "Browse and search products", description = "Returns paginated list of published products with multi-facet filters")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> listProducts(
            @Parameter(description = "Category slug filter", example = "protein")
            @RequestParam(required = false) String category,

            @Parameter(description = "Subcategory slug filter", example = "whey-isolate")
            @RequestParam(required = false) String subcategory,

            @Parameter(description = "Brand slug filter", example = "provana")
            @RequestParam(required = false) String brand,

            @Parameter(description = "Goal tag filter", example = "Muscle Building")
            @RequestParam(required = false) String goal,

            @Parameter(description = "Search term in name, description, or highlight")
            @RequestParam(required = false) String search,

            @PageableDefault(size = 20) Pageable pageable) {

        PageResponse<ProductSummaryResponse> response = productService.listCustomerProducts(
                category, subcategory, brand, goal, search, pageable
        );
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Get product detail page (PDP)", description = "Returns complete product details, variants, SKUs, pricing, media, nutrition, and FAQs")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getProductDetail(
            @Parameter(description = "Product URL Slug", example = "provana-100-pure-whey-isolate")
            @PathVariable String slug) {

        ProductDetailResponse response = productService.getCustomerProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{slug}/variants")
    @Operation(summary = "Get product variants", description = "Returns active variants and sellable SKUs for product")
    public ResponseEntity<ApiResponse<List<VariantResponse>>> getProductVariants(@PathVariable String slug) {
        ProductDetailResponse product = productService.getCustomerProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(variantService.getVariantsByProductId(product.id(), true)));
    }

    @GetMapping("/{slug}/media")
    @Operation(summary = "Get product media gallery", description = "Returns active images and videos for product")
    public ResponseEntity<ApiResponse<List<ProductMediaResponse>>> getProductMedia(@PathVariable String slug) {
        ProductDetailResponse product = productService.getCustomerProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(mediaService.getMediaByProductId(product.id(), true)));
    }

    @GetMapping("/{slug}/nutrition")
    @Operation(summary = "Get product nutrition facts", description = "Returns detailed nutritional profile and macronutrient breakdown")
    public ResponseEntity<ApiResponse<NutritionResponse>> getProductNutrition(@PathVariable String slug) {
        ProductDetailResponse product = productService.getCustomerProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(nutritionService.getNutritionByProductId(product.id())));
    }

    @GetMapping("/{slug}/faqs")
    @Operation(summary = "Get product FAQs", description = "Returns active frequently asked questions for product")
    public ResponseEntity<ApiResponse<List<ProductFaqResponse>>> getProductFaqs(@PathVariable String slug) {
        ProductDetailResponse product = productService.getCustomerProductBySlug(slug);
        return ResponseEntity.ok(ApiResponse.ok(faqService.getFaqsByProductId(product.id(), true)));
    }
}

package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.*;
import com.provana.catalog.entity.ProductStatus;
import com.provana.catalog.service.*;
import com.provana.common.response.ApiResponse;
import com.provana.common.response.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/products")
@Tag(name = "Admin Catalogue: Products", description = "Administrative catalogue management for products, variants, SKUs, media, and nutrition")
public class AdminProductController {

    private final ProductService productService;
    private final ProductVariantService variantService;
    private final SkuService skuService;
    private final ProductMediaService mediaService;
    private final ProductNutritionService nutritionService;
    private final ProductFaqService faqService;
    private final AdminSecurityService securityService;

    public AdminProductController(ProductService productService,
                                  ProductVariantService variantService,
                                  SkuService skuService,
                                  ProductMediaService mediaService,
                                  ProductNutritionService nutritionService,
                                  ProductFaqService faqService,
                                  AdminSecurityService securityService) {
        this.productService = productService;
        this.variantService = variantService;
        this.skuService = skuService;
        this.mediaService = mediaService;
        this.nutritionService = nutritionService;
        this.faqService = faqService;
        this.securityService = securityService;
    }

    // ==========================================
    // PRODUCT ENDPOINTS
    // ==========================================

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'PRODUCT_READ')")
    @Operation(summary = "List all products (Admin)", description = "Includes DRAFT, PUBLISHED, and UNPUBLISHED products")
    public ResponseEntity<ApiResponse<PageResponse<ProductSummaryResponse>>> listAdminProducts(
            @RequestParam(required = false) ProductStatus status,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable) {

        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.PRODUCT_READ);
        return ResponseEntity.ok(ApiResponse.ok(productService.listAdminProducts(status, search, pageable)));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'PRODUCT_READ')")
    @Operation(summary = "Get product by ID (Admin)")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> getAdminProduct(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.PRODUCT_READ);
        return ResponseEntity.ok(ApiResponse.ok(productService.getAdminProductById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_CREATE')")
    @Operation(summary = "Create conceptual product", description = "Requires CATALOGUE_WRITE or PRODUCT_CREATE permission")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> createProduct(
            @Valid @RequestBody CreateProductRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_CREATE);
        ProductDetailResponse response = productService.createProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_UPDATE')")
    @Operation(summary = "Update conceptual product", description = "Requires CATALOGUE_WRITE or PRODUCT_UPDATE permission")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_UPDATE);
        return ResponseEntity.ok(ApiResponse.ok(productService.updateProduct(id, request)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_UPDATE', 'PRODUCT_PUBLISH')")
    @Operation(summary = "Update product status", description = "Transition between DRAFT, PUBLISHED, UNPUBLISHED")
    public ResponseEntity<ApiResponse<ProductDetailResponse>> updateProductStatus(
            @PathVariable UUID id,
            @RequestParam ProductStatus status) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_UPDATE, Permission.PRODUCT_PUBLISH);
        return ResponseEntity.ok(ApiResponse.ok(productService.updateProductStatus(id, status)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'PRODUCT_DELETE')")
    @Operation(summary = "Delete or unpublish product", description = "Requires CATALOGUE_DELETE or PRODUCT_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.PRODUCT_DELETE);
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Product removed or safely unpublished"));
    }

    // ==========================================
    // VARIANT ENDPOINTS
    // ==========================================

    @PostMapping("/{id}/variants")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_VARIANT_CREATE')")
    @Operation(summary = "Add variant to product")
    public ResponseEntity<ApiResponse<VariantResponse>> addVariant(
            @PathVariable UUID id,
            @Valid @RequestBody VariantRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_VARIANT_CREATE);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(variantService.createVariant(request)));
    }

    @PutMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_VARIANT_UPDATE')")
    @Operation(summary = "Update variant")
    public ResponseEntity<ApiResponse<VariantResponse>> updateVariant(
            @PathVariable UUID variantId,
            @Valid @RequestBody VariantRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_VARIANT_UPDATE);
        return ResponseEntity.ok(ApiResponse.ok(variantService.updateVariant(variantId, request)));
    }

    @DeleteMapping("/variants/{variantId}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'PRODUCT_VARIANT_DELETE')")
    @Operation(summary = "Deactivate variant")
    public ResponseEntity<ApiResponse<Void>> deleteVariant(@PathVariable UUID variantId) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.PRODUCT_VARIANT_DELETE);
        variantService.deleteVariant(variantId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Variant deactivated"));
    }

    // ==========================================
    // SKU ENDPOINTS
    // ==========================================

    @PostMapping("/skus")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'SKU_CREATE')")
    @Operation(summary = "Create sellable SKU under variant")
    public ResponseEntity<ApiResponse<SkuResponse>> createSku(@Valid @RequestBody SkuRequest request) {
        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.SKU_CREATE);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(skuService.createSku(request)));
    }

    @PutMapping("/skus/{skuId}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'SKU_UPDATE')")
    @Operation(summary = "Update sellable SKU")
    public ResponseEntity<ApiResponse<SkuResponse>> updateSku(
            @PathVariable UUID skuId,
            @Valid @RequestBody SkuRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.SKU_UPDATE);
        return ResponseEntity.ok(ApiResponse.ok(skuService.updateSku(skuId, request)));
    }

    @DeleteMapping("/skus/{skuId}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'SKU_DELETE')")
    @Operation(summary = "Deactivate sellable SKU")
    public ResponseEntity<ApiResponse<Void>> deleteSku(@PathVariable UUID skuId) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.SKU_DELETE);
        skuService.deleteSku(skuId);
        return ResponseEntity.ok(ApiResponse.ok(null, "SKU deactivated"));
    }

    // ==========================================
    // MEDIA ENDPOINTS
    // ==========================================

    @PostMapping("/{id}/media")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_MEDIA_CREATE', 'CATALOGUE_MEDIA_MANAGE')")
    @Operation(summary = "Add image/video media to product")
    public ResponseEntity<ApiResponse<ProductMediaResponse>> addMedia(
            @PathVariable UUID id,
            @Valid @RequestBody ProductMediaRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_MEDIA_CREATE, Permission.CATALOGUE_MEDIA_MANAGE);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(mediaService.addMedia(request)));
    }

    @DeleteMapping("/media/{mediaId}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'PRODUCT_MEDIA_DELETE', 'CATALOGUE_MEDIA_MANAGE')")
    @Operation(summary = "Delete product media")
    public ResponseEntity<ApiResponse<Void>> deleteMedia(@PathVariable UUID mediaId) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.PRODUCT_MEDIA_DELETE, Permission.CATALOGUE_MEDIA_MANAGE);
        mediaService.deleteMedia(mediaId);
        return ResponseEntity.ok(ApiResponse.ok(null, "Media deleted"));
    }

    // ==========================================
    // NUTRITION ENDPOINTS
    // ==========================================

    @PutMapping("/{id}/nutrition")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_NUTRITION_WRITE')")
    @Operation(summary = "Save or update nutritional facts")
    public ResponseEntity<ApiResponse<NutritionResponse>> saveNutrition(
            @PathVariable UUID id,
            @Valid @RequestBody NutritionRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_NUTRITION_WRITE);
        return ResponseEntity.ok(ApiResponse.ok(nutritionService.saveOrUpdateNutrition(id, request)));
    }

    // ==========================================
    // FAQ ENDPOINTS
    // ==========================================

    @PostMapping("/{id}/faqs")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'PRODUCT_FAQ_WRITE')")
    @Operation(summary = "Add FAQ to product")
    public ResponseEntity<ApiResponse<ProductFaqResponse>> addFaq(
            @PathVariable UUID id,
            @Valid @RequestBody ProductFaqRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.PRODUCT_FAQ_WRITE);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(faqService.addFaq(request)));
    }

    @DeleteMapping("/faqs/{faqId}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'PRODUCT_FAQ_WRITE')")
    @Operation(summary = "Delete FAQ")
    public ResponseEntity<ApiResponse<Void>> deleteFaq(@PathVariable UUID faqId) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.PRODUCT_FAQ_WRITE);
        faqService.deleteFaq(faqId);
        return ResponseEntity.ok(ApiResponse.ok(null, "FAQ deleted"));
    }
}

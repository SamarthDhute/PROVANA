package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.BrandRequest;
import com.provana.catalog.dto.BrandResponse;
import com.provana.catalog.service.BrandService;
import com.provana.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/brands")
@Tag(name = "Admin Catalogue: Brands", description = "Administrative brand management APIs")
public class AdminBrandController {

    private final BrandService brandService;
    private final AdminSecurityService securityService;

    public AdminBrandController(BrandService brandService, AdminSecurityService securityService) {
        this.brandService = brandService;
        this.securityService = securityService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'BRAND_READ')")
    @Operation(summary = "List all brands (Admin)", description = "Requires CATALOGUE_READ or BRAND_READ permission")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands() {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.BRAND_READ);
        return ResponseEntity.ok(ApiResponse.ok(brandService.getAllBrands()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'BRAND_READ')")
    @Operation(summary = "Get brand by ID (Admin)", description = "Requires CATALOGUE_READ or BRAND_READ permission")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.BRAND_READ);
        return ResponseEntity.ok(ApiResponse.ok(brandService.getBrandById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'BRAND_CREATE')")
    @Operation(summary = "Create brand", description = "Requires CATALOGUE_WRITE or BRAND_CREATE permission")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody BrandRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.BRAND_CREATE);
        BrandResponse response = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'BRAND_UPDATE')")
    @Operation(summary = "Update brand", description = "Requires CATALOGUE_WRITE or BRAND_UPDATE permission")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody BrandRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.BRAND_UPDATE);
        return ResponseEntity.ok(ApiResponse.ok(brandService.updateBrand(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'BRAND_DELETE')")
    @Operation(summary = "Delete or deactivate brand", description = "Requires CATALOGUE_DELETE or BRAND_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.BRAND_DELETE);
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Brand removed or safely deactivated"));
    }
}

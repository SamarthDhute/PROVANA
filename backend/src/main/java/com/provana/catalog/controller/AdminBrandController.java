package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.BrandRequest;
import com.provana.catalog.dto.BrandResponse;
import com.provana.catalog.service.BrandService;
import com.provana.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    @Operation(summary = "List all brands (Admin)", description = "Requires CATALOGUE_READ permission")
    public ResponseEntity<ApiResponse<List<BrandResponse>>> getAllBrands(
            @Parameter(description = "Admin user role", example = "ADMIN")
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_READ);
        return ResponseEntity.ok(ApiResponse.ok(brandService.getAllBrands()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get brand by ID (Admin)", description = "Requires CATALOGUE_READ permission")
    public ResponseEntity<ApiResponse<BrandResponse>> getBrandById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_READ);
        return ResponseEntity.ok(ApiResponse.ok(brandService.getBrandById(id)));
    }

    @PostMapping
    @Operation(summary = "Create brand", description = "Requires CATALOGUE_WRITE permission")
    public ResponseEntity<ApiResponse<BrandResponse>> createBrand(
            @Valid @RequestBody BrandRequest request,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        BrandResponse response = brandService.createBrand(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update brand", description = "Requires CATALOGUE_WRITE permission")
    public ResponseEntity<ApiResponse<BrandResponse>> updateBrand(
            @PathVariable UUID id,
            @Valid @RequestBody BrandRequest request,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        return ResponseEntity.ok(ApiResponse.ok(brandService.updateBrand(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete or deactivate brand", description = "Requires CATALOGUE_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteBrand(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_DELETE);
        brandService.deleteBrand(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Brand removed or safely deactivated"));
    }
}

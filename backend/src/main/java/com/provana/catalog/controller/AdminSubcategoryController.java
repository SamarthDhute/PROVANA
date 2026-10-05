package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.SubcategoryRequest;
import com.provana.catalog.dto.SubcategoryResponse;
import com.provana.catalog.service.SubcategoryService;
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
@RequestMapping("/api/v1/admin/subcategories")
@Tag(name = "Admin Catalogue: Subcategories", description = "Administrative subcategory management APIs")
public class AdminSubcategoryController {

    private final SubcategoryService subcategoryService;
    private final AdminSecurityService securityService;

    public AdminSubcategoryController(SubcategoryService subcategoryService, AdminSecurityService securityService) {
        this.subcategoryService = subcategoryService;
        this.securityService = securityService;
    }

    @GetMapping
    @Operation(summary = "List all subcategories (Admin)", description = "Requires CATALOGUE_READ permission")
    public ResponseEntity<ApiResponse<List<SubcategoryResponse>>> getAllSubcategories(
            @Parameter(description = "Admin user role", example = "ADMIN")
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_READ);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getAllSubcategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get subcategory by ID (Admin)", description = "Requires CATALOGUE_READ permission")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> getSubcategoryById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_READ);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getSubcategoryById(id)));
    }

    @PostMapping
    @Operation(summary = "Create subcategory", description = "Requires CATALOGUE_WRITE permission")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> createSubcategory(
            @Valid @RequestBody SubcategoryRequest request,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        SubcategoryResponse response = subcategoryService.createSubcategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update subcategory", description = "Requires CATALOGUE_WRITE permission")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> updateSubcategory(
            @PathVariable UUID id,
            @Valid @RequestBody SubcategoryRequest request,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.updateSubcategory(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete or deactivate subcategory", description = "Requires CATALOGUE_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteSubcategory(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_DELETE);
        subcategoryService.deleteSubcategory(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Subcategory removed or safely deactivated"));
    }
}

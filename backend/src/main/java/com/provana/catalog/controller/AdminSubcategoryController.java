package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.SubcategoryRequest;
import com.provana.catalog.dto.SubcategoryResponse;
import com.provana.catalog.service.SubcategoryService;
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
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'SUBCATEGORY_READ')")
    @Operation(summary = "List all subcategories (Admin)", description = "Requires CATALOGUE_READ or SUBCATEGORY_READ permission")
    public ResponseEntity<ApiResponse<List<SubcategoryResponse>>> getAllSubcategories() {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.SUBCATEGORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getAllSubcategories()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'SUBCATEGORY_READ')")
    @Operation(summary = "Get subcategory by ID (Admin)", description = "Requires CATALOGUE_READ or SUBCATEGORY_READ permission")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> getSubcategoryById(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.SUBCATEGORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.getSubcategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'SUBCATEGORY_CREATE')")
    @Operation(summary = "Create subcategory", description = "Requires CATALOGUE_WRITE or SUBCATEGORY_CREATE permission")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> createSubcategory(
            @Valid @RequestBody SubcategoryRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.SUBCATEGORY_CREATE);
        SubcategoryResponse response = subcategoryService.createSubcategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'SUBCATEGORY_UPDATE')")
    @Operation(summary = "Update subcategory", description = "Requires CATALOGUE_WRITE or SUBCATEGORY_UPDATE permission")
    public ResponseEntity<ApiResponse<SubcategoryResponse>> updateSubcategory(
            @PathVariable UUID id,
            @Valid @RequestBody SubcategoryRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.SUBCATEGORY_UPDATE);
        return ResponseEntity.ok(ApiResponse.ok(subcategoryService.updateSubcategory(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'SUBCATEGORY_DELETE')")
    @Operation(summary = "Delete or deactivate subcategory", description = "Requires CATALOGUE_DELETE or SUBCATEGORY_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteSubcategory(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.SUBCATEGORY_DELETE);
        subcategoryService.deleteSubcategory(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Subcategory removed or safely deactivated"));
    }
}

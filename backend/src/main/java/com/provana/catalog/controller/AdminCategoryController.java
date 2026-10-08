package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.CategoryRequest;
import com.provana.catalog.dto.CategoryResponse;
import com.provana.catalog.service.CategoryService;
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
@RequestMapping("/api/v1/admin/categories")
@Tag(name = "Admin Catalogue: Categories", description = "Administrative category management APIs")
public class AdminCategoryController {

    private final CategoryService categoryService;
    private final AdminSecurityService securityService;

    public AdminCategoryController(CategoryService categoryService, AdminSecurityService securityService) {
        this.categoryService = categoryService;
        this.securityService = securityService;
    }

    @GetMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'CATEGORY_READ')")
    @Operation(summary = "List all categories (Admin)", description = "Requires CATALOGUE_READ or CATEGORY_READ permission")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories() {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.CATEGORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_READ', 'CATEGORY_READ')")
    @Operation(summary = "Get category by ID (Admin)", description = "Requires CATALOGUE_READ or CATEGORY_READ permission")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_READ, Permission.CATEGORY_READ);
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @PostMapping
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'CATEGORY_CREATE')")
    @Operation(summary = "Create category", description = "Requires CATALOGUE_WRITE or CATEGORY_CREATE permission")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.CATEGORY_CREATE);
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_WRITE', 'CATEGORY_UPDATE')")
    @Operation(summary = "Update category", description = "Requires CATALOGUE_WRITE or CATEGORY_UPDATE permission")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request) {

        securityService.checkAnyPermission(Permission.CATALOGUE_WRITE, Permission.CATEGORY_UPDATE);
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('CATALOGUE_DELETE', 'CATEGORY_DELETE')")
    @Operation(summary = "Delete or deactivate category", description = "Requires CATALOGUE_DELETE or CATEGORY_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        securityService.checkAnyPermission(Permission.CATALOGUE_DELETE, Permission.CATEGORY_DELETE);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Category removed or safely deactivated"));
    }
}

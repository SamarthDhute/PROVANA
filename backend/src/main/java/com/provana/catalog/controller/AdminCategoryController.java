package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.CategoryRequest;
import com.provana.catalog.dto.CategoryResponse;
import com.provana.catalog.service.CategoryService;
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
    @Operation(summary = "List all categories (Admin)", description = "Requires CATALOGUE_READ permission")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAllCategories(
            @Parameter(description = "Admin user role", example = "ADMIN")
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_READ);
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategories()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get category by ID (Admin)", description = "Requires CATALOGUE_READ permission")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_READ);
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getCategoryById(id)));
    }

    @PostMapping
    @Operation(summary = "Create category", description = "Requires CATALOGUE_WRITE permission")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        CategoryResponse response = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.created(response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update category", description = "Requires CATALOGUE_WRITE permission")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryRequest request,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        return ResponseEntity.ok(ApiResponse.ok(categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete or deactivate category", description = "Requires CATALOGUE_DELETE permission")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable UUID id,
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_DELETE);
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.ok(null, "Category removed or safely deactivated"));
    }
}

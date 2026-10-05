package com.provana.catalog.controller;

import com.provana.auth.AdminSecurityService;
import com.provana.auth.Permission;
import com.provana.catalog.dto.FileUploadResponse;
import com.provana.catalog.service.SupabaseStorageService;
import com.provana.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/admin/media")
@Tag(name = "Admin Storage: Media Upload", description = "Direct asset upload to Supabase cloud storage")
public class AdminMediaUploadController {

    private final SupabaseStorageService storageService;
    private final AdminSecurityService securityService;

    public AdminMediaUploadController(SupabaseStorageService storageService, AdminSecurityService securityService) {
        this.storageService = storageService;
        this.securityService = securityService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload image or video asset to Supabase", description = "Uploads file to Supabase bucket and returns public CDN URL")
    public ResponseEntity<ApiResponse<FileUploadResponse>> uploadMedia(
            @Parameter(description = "Asset file (image/png, image/jpeg, image/webp, video/mp4)")
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "Storage directory folder (e.g. products, categories, brands)", example = "products")
            @RequestParam(value = "folder", defaultValue = "products") String folder,

            @Parameter(description = "Admin role credential", example = "ADMIN")
            @RequestHeader(value = "X-Admin-Role", required = false) String adminRole) {

        securityService.checkPermission(adminRole, Permission.CATALOGUE_WRITE);
        FileUploadResponse response = storageService.uploadFile(file, folder);
        return ResponseEntity.ok(ApiResponse.ok(response, "Asset uploaded successfully to Supabase Storage"));
    }
}

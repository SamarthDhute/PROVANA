package com.provana.catalog.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Storage file upload response")
public record FileUploadResponse(
        @Schema(description = "Public CDN/Storage URL for the uploaded asset", example = "https://ocsvfxbamfbwrxpydrda.supabase.co/storage/v1/object/public/provana-media/products/sample.webp")
        String url,

        @Schema(description = "Saved file name", example = "whey_isolated_1728130000.webp")
        String fileName,

        @Schema(description = "MIME Content Type", example = "image/webp")
        String contentType,

        @Schema(description = "File size in bytes", example = "245120")
        long size
) {}

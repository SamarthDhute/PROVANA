package com.provana.catalog.service;

import com.provana.catalog.dto.FileUploadResponse;
import com.provana.common.exception.BadRequestException;
import com.provana.config.SupabaseProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.UUID;

@Service
public class SupabaseStorageService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseStorageService.class);

    private final SupabaseProperties properties;
    private final RestClient restClient;

    public SupabaseStorageService(SupabaseProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.builder()
                .baseUrl(properties.getUrl())
                .build();
    }

    public FileUploadResponse uploadFile(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file cannot be empty");
        }

        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "asset";
        String cleanExtension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            cleanExtension = originalFilename.substring(dotIndex);
        }

        String sanitizedFolder = (folder == null || folder.isBlank()) ? "products" : folder.replaceAll("[^a-zA-Z0-9_-]", "");
        String uniqueFileName = UUID.randomUUID() + cleanExtension;
        String storagePath = sanitizedFolder + "/" + uniqueFileName;
        String contentType = file.getContentType() != null ? file.getContentType() : MediaType.APPLICATION_OCTET_STREAM_VALUE;

        // Public CDN URL format in Supabase
        String publicUrl = String.format("%s/storage/v1/object/public/%s/%s",
                properties.getUrl().replaceAll("/+$", ""),
                properties.getBucket(),
                storagePath
        );

        if (properties.getApiKey() == null || properties.getApiKey().isBlank()) {
            log.warn("SUPABASE_API_KEY is not configured yet. Returning simulated public URL: {}", publicUrl);
            return new FileUploadResponse(publicUrl, uniqueFileName, contentType, file.getSize());
        }

        try {
            byte[] fileBytes = file.getBytes();
            String uploadUri = String.format("/storage/v1/object/%s/%s", properties.getBucket(), storagePath);

            ResponseEntity<String> response = restClient.post()
                    .uri(uploadUri)
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + properties.getApiKey())
                    .header("apikey", properties.getApiKey())
                    .header(HttpHeaders.CONTENT_TYPE, contentType)
                    .body(fileBytes)
                    .retrieve()
                    .toEntity(String.class);

            log.info("Supabase storage upload successful: status={}, path={}", response.getStatusCode(), storagePath);
            return new FileUploadResponse(publicUrl, uniqueFileName, contentType, file.getSize());

        } catch (IOException e) {
            log.error("Failed to read file bytes for upload: {}", e.getMessage(), e);
            throw new BadRequestException("Could not process file upload: " + e.getMessage());
        } catch (Exception e) {
            log.error("Supabase storage upload error: {}", e.getMessage(), e);
            throw new BadRequestException("Failed to upload asset to Supabase Storage: " + e.getMessage());
        }
    }
}

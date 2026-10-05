package com.provana.common.response;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Standard Paginated Response DTO for PROVANA Catalog & Commerce queries.
 *
 * @param <T> Element type in current page
 */
@Schema(description = "Standard pagination container")
public record PageResponse<T>(
        @Schema(description = "Current page items")
        List<T> content,

        @Schema(description = "Current page index (0-based)", example = "0")
        int page,

        @Schema(description = "Page size", example = "20")
        int size,

        @Schema(description = "Total number of elements across all pages", example = "142")
        long totalElements,

        @Schema(description = "Total number of pages", example = "8")
        int totalPages,

        @Schema(description = "Indicates if this is the first page", example = "true")
        boolean first,

        @Schema(description = "Indicates if this is the last page", example = "false")
        boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}

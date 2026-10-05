package com.provana.health.controller;

import com.provana.common.response.ApiResponse;
import com.provana.common.util.AppConstants;
import com.provana.health.dto.HealthStatusDto;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.env.Environment;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.lang.management.ManagementFactory;
import java.sql.Connection;
import java.sql.Statement;
import java.time.Instant;
import java.util.Arrays;

/**
 * Health & Operational Diagnostics REST Controller.
 * <p>
 * Provides live application diagnostics, database liveness probe, and version metadata.
 */
@RestController
@RequestMapping(AppConstants.API_V1_PREFIX + "/health")
@Tag(name = "Health & Diagnostics", description = "Operational probes, platform readiness, and database connectivity")
public class HealthStatusController {

    private static final Logger log = LoggerFactory.getLogger(HealthStatusController.class);

    private final DataSource dataSource;
    private final Environment environment;

    public HealthStatusController(DataSource dataSource, Environment environment) {
        this.dataSource = dataSource;
        this.environment = environment;
    }

    @GetMapping
    @Operation(summary = "Check API health and database connectivity", description = "Executes an active probe against the PostgreSQL database to verify platform operational readiness.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Platform and database are operational"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "503", description = "Database or internal dependencies are unreachable")
    })
    public ResponseEntity<ApiResponse<HealthStatusDto>> getHealth(HttpServletRequest request) {
        String dbStatus = checkDatabaseConnectivity();
        long uptimeSeconds = ManagementFactory.getRuntimeMXBean().getUptime() / 1000;
        String activeProfile = Arrays.toString(environment.getActiveProfiles().length == 0 ? environment.getDefaultProfiles() : environment.getActiveProfiles());

        HealthStatusDto statusDto = new HealthStatusDto(
                "UP",
                dbStatus,
                "1.0.0-PHASE0",
                activeProfile,
                uptimeSeconds,
                Instant.now()
        );

        if (!"CONNECTED".equals(dbStatus)) {
            log.error("Database connectivity probe failed: {}", dbStatus);
            return ResponseEntity
                    .status(503)
                    .body(ApiResponse.error("Platform health degraded — Database unreachable", request.getRequestURI()));
        }

        return ResponseEntity.ok(ApiResponse.success(statusDto, "PROVANA Platform is fully operational", request.getRequestURI()));
    }

    private String checkDatabaseConnectivity() {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute("SELECT 1");
            return "CONNECTED";
        } catch (Exception e) {
            log.error("Database probe error: ", e);
            return "DISCONNECTED: " + e.getMessage();
        }
    }
}

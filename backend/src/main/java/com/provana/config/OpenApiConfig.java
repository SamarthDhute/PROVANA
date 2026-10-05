package com.provana.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI 3.0 / Swagger UI Configuration for PROVANA E-Commerce Platform.
 */
@Configuration
public class OpenApiConfig {

    private static final String SECURITY_SCHEME_NAME = "BearerAuth";

    @Bean
    public OpenAPI customOpenAPI(
            @Value("${spring.application.name:provana-backend}") String appName,
            @Value("${server.port:8080}") String serverPort,
            @Value("${server.servlet.context-path:/}") String contextPath) {

        return new OpenAPI()
                .info(new Info()
                        .title("PROVANA — Sports Nutrition & Fitness E-Commerce API")
                        .description("""
                                Authoritative REST API for PROVANA D-to-C Sports Nutrition & Wellness Platform.
                                
                                **Key Architectural Principles:**
                                - *CMS controls presentation; application code controls commerce behavior.*
                                - Server-authoritative pricing, inventory reservations, coupons, and orders.
                                - Strict DTO encapsulation (JPA entities are never directly exposed).
                                """)
                        .version("1.0.0-PHASE0")
                        .contact(new Contact()
                                .name("PROVANA Engineering Team")
                                .email("engineering@provana.com")
                                .url("https://provana.com"))
                        .license(new License()
                                .name("Proprietary")
                                .url("https://provana.com/terms")))
                .servers(List.of(
                        new Server()
                                .url("http://localhost:" + serverPort + (contextPath.endsWith("/") ? contextPath.substring(0, contextPath.length() - 1) : contextPath))
                                .description("Local Development Server")
                ))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME_NAME))
                .components(new Components()
                        .addSecuritySchemes(SECURITY_SCHEME_NAME, new SecurityScheme()
                                .name(SECURITY_SCHEME_NAME)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Enter JWT token acquired from /api/v1/auth/login")));
    }
}

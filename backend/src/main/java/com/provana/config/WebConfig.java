package com.provana.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.Arrays;

/**
 * Spring Web MVC Configuration: CORS mapping for PROVANA frontend clients.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${provana.cors.allowed-origins:http://localhost:3000,http://localhost:3001}")
    private String allowedOrigins;

    @Value("${provana.cors.allowed-methods:GET,POST,PUT,PATCH,DELETE,OPTIONS}")
    private String allowedMethods;

    @Value("${provana.cors.allowed-headers:*}")
    private String allowedHeaders;

    @Value("${provana.cors.allow-credentials:true}")
    private boolean allowCredentials;

    @Value("${provana.cors.max-age:3600}")
    private long maxAge;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String[] origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .toArray(String[]::new);

        String[] methods = Arrays.stream(allowedMethods.split(","))
                .map(String::trim)
                .toArray(String[]::new);

        registry.addMapping("/**")
                .allowedOrigins(origins)
                .allowedMethods(methods)
                .allowedHeaders(allowedHeaders)
                .allowCredentials(allowCredentials)
                .maxAge(maxAge);
    }
}

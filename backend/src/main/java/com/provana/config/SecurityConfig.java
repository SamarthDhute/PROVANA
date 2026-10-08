package com.provana.config;

import com.provana.auth.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.time.Instant;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public authentication endpoints
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        // Public operational & documentation endpoints
                        .requestMatchers("/api/v1/health/**", "/actuator/**", "/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        // Public customer catalogue read endpoints
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**", "/api/v1/subcategories/**", "/api/v1/brands/**", "/api/v1/products/**").permitAll()
                        // User & RBAC Management: ADMIN only
                        .requestMatchers("/api/v1/admin/users/**").hasRole("ADMIN")

                        // Inventory Management: ADMIN, MANAGER
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/inventory/**").hasAnyRole("ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/admin/inventory/*/adjust").hasAnyAuthority("INVENTORY_ADJUST")
                        .requestMatchers("/api/v1/admin/inventory/**").hasAnyRole("ADMIN", "MANAGER")

                        // Media Upload: ADMIN, PRODUCT_MANAGER, CONTENT_MANAGER
                        .requestMatchers("/api/v1/admin/media/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER", "CONTENT_MANAGER")

                        // Catalogue Read (Categories, Subcategories, Brands, Products): ADMIN, PRODUCT_MANAGER, MANAGER, CONTENT_MANAGER, ORDER_MANAGER
                        .requestMatchers(HttpMethod.GET, "/api/v1/admin/categories/**", "/api/v1/admin/subcategories/**", "/api/v1/admin/brands/**", "/api/v1/admin/products/**")
                        .hasAnyRole("ADMIN", "PRODUCT_MANAGER", "MANAGER", "CONTENT_MANAGER", "ORDER_MANAGER")

                        // Catalogue Writes (Create, Update, Delete Products/Categories/Brands/Variants/SKUs): ADMIN, PRODUCT_MANAGER only
                        .requestMatchers("/api/v1/admin/categories/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/api/v1/admin/subcategories/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/api/v1/admin/brands/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")
                        .requestMatchers("/api/v1/admin/products/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER")

                        // All other /admin/** endpoints require administrative role (no CUSTOMER access)
                        .requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "PRODUCT_MANAGER", "MANAGER", "CONTENT_MANAGER", "ORDER_MANAGER")
                        .anyRequest().authenticated()
                )
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.getWriter().write("""
                                {"success":false,"message":"Authentication required: Administrative credentials must be supplied via a valid JWT Bearer token","timestamp":"%s","path":"%s"}
                                """.formatted(Instant.now(), request.getRequestURI()));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setContentType("application/json;charset=UTF-8");
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.getWriter().write("""
                                {"success":false,"message":"Access denied: Insufficient privileges for administrative resource","timestamp":"%s","path":"%s"}
                                """.formatted(Instant.now(), request.getRequestURI()));
                        })
                )
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

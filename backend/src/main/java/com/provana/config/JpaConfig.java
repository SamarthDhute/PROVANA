package com.provana.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing Configuration for automated createdAt/updatedAt timestamp management.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}

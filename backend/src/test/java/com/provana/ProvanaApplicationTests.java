package com.provana;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@ActiveProfiles("test")
class ProvanaApplicationTests {

    @Test
    @DisplayName("Context Loads: Verifies Spring Boot application context and PostgreSQL/Flyway initialization")
    void contextLoads() {
        assertTrue(true, "Spring Boot application context loaded successfully");
    }
}

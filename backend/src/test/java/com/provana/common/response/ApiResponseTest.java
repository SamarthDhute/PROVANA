package com.provana.common.response;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ApiResponseTest {

    @Test
    @DisplayName("ApiResponse.success(): Generates well-formed success envelope")
    void testSuccessResponse() {
        String testData = "Test Payload";
        ApiResponse<String> response = ApiResponse.success(testData, "Custom success message", "/api/v1/test");

        assertTrue(response.success());
        assertEquals("Custom success message", response.message());
        assertEquals("Test Payload", response.data());
        assertNull(response.errors());
        assertEquals("/api/v1/test", response.path());
        assertNotNull(response.timestamp());
    }

    @Test
    @DisplayName("ApiResponse.error(): Generates error envelope with validation items")
    void testErrorResponse() {
        ValidationError error1 = new ValidationError("email", "Email cannot be blank");
        ValidationError error2 = new ValidationError("password", "Password must be at least 8 characters");

        ApiResponse<Void> response = ApiResponse.error("Validation failed", List.of(error1, error2), "/api/v1/auth/register");

        assertFalse(response.success());
        assertEquals("Validation failed", response.message());
        assertNull(response.data());
        assertEquals(2, response.errors().size());
        assertEquals("email", response.errors().get(0).field());
        assertEquals("/api/v1/auth/register", response.path());
        assertNotNull(response.timestamp());
    }
}

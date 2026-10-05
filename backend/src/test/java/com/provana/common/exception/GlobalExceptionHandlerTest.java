package com.provana.common.exception;

import com.provana.common.response.ApiResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;
    private MockHttpServletRequest request;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
        request = new MockHttpServletRequest();
        request.setRequestURI("/api/v1/test");
    }

    @Test
    @DisplayName("Handle ResourceNotFoundException: Returns 404 with error message")
    void testHandleResourceNotFound() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Product", "slug", "whey-isolate");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleProvanaException(ex, request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().success());
        assertEquals("Product not found with slug: 'whey-isolate'", response.getBody().message());
        assertEquals("/api/v1/test", response.getBody().path());
    }

    @Test
    @DisplayName("Handle BusinessRuleViolationException: Returns 422 Unprocessable Entity")
    void testHandleBusinessRuleViolation() {
        BusinessRuleViolationException ex = new BusinessRuleViolationException("Insufficient stock for SKU PV-WHEY-1KG");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleProvanaException(ex, request);

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().success());
        assertEquals("Insufficient stock for SKU PV-WHEY-1KG", response.getBody().message());
    }

    @Test
    @DisplayName("Handle DuplicateResourceException: Returns 409 Conflict")
    void testHandleDuplicateResource() {
        DuplicateResourceException ex = new DuplicateResourceException("User", "email", "athlete@provana.com");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleProvanaException(ex, request);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().success());
        assertEquals("User already exists with email: 'athlete@provana.com'", response.getBody().message());
    }

    @Test
    @DisplayName("Handle Uncaught Exception: Returns 500 without leaking stack trace")
    void testHandleAllUncaught() {
        RuntimeException ex = new RuntimeException("Unexpected internal failure with sensitive details");
        ResponseEntity<ApiResponse<Void>> response = exceptionHandler.handleAllUncaughtException(ex, request);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().success());
        assertEquals("An unexpected internal server error occurred. Please contact PROVANA support.", response.getBody().message());
        assertFalse(response.getBody().message().contains("sensitive details"), "Should never leak internal exception details to client");
    }
}

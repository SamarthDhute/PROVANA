package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when a requested resource (product, user, order, category, etc.) is not found.
 */
public class ResourceNotFoundException extends ProvanaException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue), HttpStatus.NOT_FOUND);
    }
}

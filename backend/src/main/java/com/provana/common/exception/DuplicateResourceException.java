package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when attempting to create an entity that already exists (unique email, SKU code, slug, etc.).
 */
public class DuplicateResourceException extends ProvanaException {

    public DuplicateResourceException(String message) {
        super(message, HttpStatus.CONFLICT);
    }

    public DuplicateResourceException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue), HttpStatus.CONFLICT);
    }
}

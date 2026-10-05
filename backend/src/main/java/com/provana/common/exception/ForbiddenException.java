package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an authenticated user lacks the required role or permission for a resource.
 */
public class ForbiddenException extends ProvanaException {

    public ForbiddenException(String message) {
        super(message, HttpStatus.FORBIDDEN);
    }
}

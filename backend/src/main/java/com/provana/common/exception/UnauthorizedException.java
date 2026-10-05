package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when authentication is required and has failed or has not yet been provided.
 */
public class UnauthorizedException extends ProvanaException {

    public UnauthorizedException(String message) {
        super(message, HttpStatus.UNAUTHORIZED);
    }
}

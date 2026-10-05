package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Base Runtime Exception for PROVANA domain and commerce operations.
 */
public abstract class ProvanaException extends RuntimeException {

    private final HttpStatus status;

    protected ProvanaException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    protected ProvanaException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}

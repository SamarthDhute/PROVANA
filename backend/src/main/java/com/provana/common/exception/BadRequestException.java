package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when client request syntax, query parameters, or formatting are invalid.
 */
public class BadRequestException extends ProvanaException {

    public BadRequestException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}

package com.provana.common.exception;

import org.springframework.http.HttpStatus;

/**
 * Thrown when an operation violates core domain rules
 * (e.g., insufficient stock, expired coupon, invalid order state transition, cart price mismatch).
 */
public class BusinessRuleViolationException extends ProvanaException {

    public BusinessRuleViolationException(String message) {
        super(message, HttpStatus.UNPROCESSABLE_ENTITY);
    }
}

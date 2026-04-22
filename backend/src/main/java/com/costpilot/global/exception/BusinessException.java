package com.costpilot.global.exception;

import org.springframework.http.HttpStatus;

public class BusinessException extends RuntimeException {

    private final int status;

    public BusinessException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST.value();
    }

    public BusinessException(String message, HttpStatus httpStatus) {
        super(message);
        this.status = httpStatus.value();
    }

    public int getStatus() {
        return status;
    }
}

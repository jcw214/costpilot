package com.costpilot.global.exception;

public record ErrorResponse(
        int status,
        String error,
        String message
) {
    public ErrorResponse(int status, String message) {
        this(status, resolveError(status), message);
    }

    private static String resolveError(int status) {
        return switch (status) {
            case 400 -> "Bad Request";
            case 404 -> "Not Found";
            case 409 -> "Conflict";
            default -> "Internal Server Error";
        };
    }
}

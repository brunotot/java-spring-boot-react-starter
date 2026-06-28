package com.brunotot.starter.config;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.ConstraintViolationException;

@RestControllerAdvice
public class GlobalExceptionHandler {

        @ExceptionHandler(MethodArgumentNotValidException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        ApiError handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
                Map<String, String> fieldErrors = new LinkedHashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

                return new ApiError(
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad request",
                                fieldErrors,
                                Instant.now());
        }

        @ExceptionHandler(BindException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        ApiError handleBindException(BindException ex) {
                Map<String, String> fieldErrors = new LinkedHashMap<>();
                ex.getBindingResult().getFieldErrors()
                                .forEach(error -> fieldErrors.put(error.getField(), error.getDefaultMessage()));

                return new ApiError(
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad request",
                                fieldErrors,
                                Instant.now());
        }

        @ExceptionHandler(ConstraintViolationException.class)
        @ResponseStatus(HttpStatus.BAD_REQUEST)
        ApiError handleConstraintViolation(ConstraintViolationException ex) {
                Map<String, String> violations = new LinkedHashMap<>();
                ex.getConstraintViolations()
                                .forEach(violation -> violations.put(violation.getPropertyPath().toString(),
                                                violation.getMessage()));

                return new ApiError(
                                HttpStatus.BAD_REQUEST.value(),
                                "Bad request",
                                violations,
                                Instant.now());
        }

        @ExceptionHandler(AuthenticationException.class)
        @ResponseStatus(HttpStatus.UNAUTHORIZED)
        ApiError handleAuthentication(AuthenticationException ex) {
                return new ApiError(
                                HttpStatus.UNAUTHORIZED.value(),
                                "Unauthorized",
                                null,
                                Instant.now());
        }

        @ExceptionHandler(AccessDeniedException.class)
        @ResponseStatus(HttpStatus.FORBIDDEN)
        ApiError handleAccessDenied(AccessDeniedException ex) {
                return new ApiError(
                                HttpStatus.FORBIDDEN.value(),
                                "Forbidden",
                                null,
                                Instant.now());
        }

        @ExceptionHandler(ResponseStatusException.class)
        ResponseEntity<ApiError> handleResponseStatusException(ResponseStatusException ex) {
                HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
                ApiError apiError = new ApiError(
                                status.value(),
                                ex.getReason() != null ? ex.getReason() : status.getReasonPhrase(),
                                null,
                                Instant.now());
                return ResponseEntity.status(status).body(apiError);
        }

        @ExceptionHandler(Exception.class)
        @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
        ApiError handleGenericException(Exception ex) {
                return new ApiError(
                                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                                "Internal server error",
                                null,
                                Instant.now());
        }
}

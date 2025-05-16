package com.nexcrm.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {
    
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        log.error("Email déjà existant: {}", ex.getEmail());
        
        ApiError apiError = ApiError.of(HttpStatus.BAD_REQUEST, "Validation failed");
        apiError.addFieldError("email", "Cet email est déjà utilisé");
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> handleIllegalArgument(IllegalArgumentException ex) {
        log.error("Erreur de validation: {}", ex.getMessage());
        
        ApiError apiError = ApiError.of(HttpStatus.BAD_REQUEST, ex.getMessage());
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        log.error("Erreur non gérée", ex);
        
        ApiError apiError = ApiError.of(HttpStatus.INTERNAL_SERVER_ERROR, "Une erreur interne s'est produite");
        
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
} 
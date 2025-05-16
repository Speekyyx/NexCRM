package com.nexcrm.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApiError {
    
    private HttpStatus status;
    
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd-MM-yyyy HH:mm:ss")
    private LocalDateTime timestamp;
    
    private String message;
    
    private Map<String, String> fieldErrors;
    
    public static ApiError of(HttpStatus status, String message) {
        return ApiError.builder()
                .status(status)
                .message(message)
                .timestamp(LocalDateTime.now())
                .fieldErrors(new HashMap<>())
                .build();
    }
    
    public void addFieldError(String field, String message) {
        if (fieldErrors == null) {
            fieldErrors = new HashMap<>();
        }
        fieldErrors.put(field, message);
    }
} 
package com.nexcrm.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    
    private final String email;
    
    public EmailAlreadyExistsException(String email) {
        super("Un client avec l'email " + email + " existe déjà");
        this.email = email;
    }
    
    public String getEmail() {
        return email;
    }
} 
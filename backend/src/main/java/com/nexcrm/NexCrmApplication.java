package com.nexcrm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.nexcrm.controller",
    "com.nexcrm.service",
    "com.nexcrm.repository",
    "com.nexcrm.config",
    "com.nexcrm.security"
})
public class NexCrmApplication {

    public static void main(String[] args) {
        SpringApplication.run(NexCrmApplication.class, args);
    }
} 
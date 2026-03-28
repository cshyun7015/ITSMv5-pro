package com.itsm.request;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class BackendRequestApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendRequestApplication.class, args);
    }

    @GetMapping("/health")
    public String health() {
        return "Request Service is UP";
    }

    @GetMapping("/")
    public String info() {
        return "ITSM v5 Request Management Service";
    }
}

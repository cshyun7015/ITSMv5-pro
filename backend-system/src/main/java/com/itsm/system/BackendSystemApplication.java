package com.itsm.system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class BackendSystemApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendSystemApplication.class, args);
    }

    @GetMapping("/health")
    public String health() {
        return "System Service is UP";
    }

    @GetMapping("/")
    public String info() {
        return "ITSM v5 System Administration Service";
    }
}

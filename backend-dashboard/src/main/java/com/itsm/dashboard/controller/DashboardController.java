package com.itsm.dashboard.controller;

import com.itsm.dashboard.dto.DashboardSummaryDTO;
import com.itsm.dashboard.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(HttpServletRequest request) {
        String companyId = (String) request.getAttribute("companyId");
        String role = (String) request.getAttribute("userRole");
        String token = (String) request.getAttribute("jwtToken");

        log.info("DashboardController Summary Request: role={}, companyId={}", role, companyId);

        if (role == null) {
            log.warn("DashboardController: Missing role attribute");
            throw new RuntimeException("Unauthorized");
        }
        
        DashboardSummaryDTO summary = dashboardService.getSummary(role, companyId, token).block();
        log.info("Dashboard Summary Aggregation Success");
        return summary;
    }
}

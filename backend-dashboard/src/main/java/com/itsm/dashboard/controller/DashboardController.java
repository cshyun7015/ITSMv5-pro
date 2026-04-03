package com.itsm.dashboard.controller;

import com.itsm.dashboard.dto.DashboardSummaryDTO;
import com.itsm.dashboard.service.DashboardService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public DashboardSummaryDTO getSummary(
            HttpServletRequest request,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String targetCompanyId) {
        
        String userCompanyId = (String) request.getAttribute("companyId");
        String role = (String) request.getAttribute("userRole");
        String token = (String) request.getAttribute("jwtToken");

        log.info("DashboardController Summary Request: role={}, userCompanyId={}, targetCompanyId={}, fromDate={}, toDate={}", 
                role, userCompanyId, targetCompanyId, fromDate, toDate);

        if (role == null) {
            log.error("DashboardController FAILURE: Missing 'userRole' attribute. Authentication context empty. Check if ITSMSession cookie is reaching the dashboard service.");
            throw new RuntimeException("Dashboard Authentication Failure: No role identified in context.");
        }

        // ROLE_USER is restricted to their own company
        String finalCompanyId = targetCompanyId;
        if ("ROLE_USER".equals(role)) {
            finalCompanyId = userCompanyId;
        }

        log.info("Aggregating dashboard data for finalCompanyId={}", finalCompanyId);
        
        try {
            DashboardSummaryDTO summary = dashboardService.getSummary(role, finalCompanyId, fromDate, toDate, token).block();
            if (summary == null) {
                log.error("DashboardController FAILURE: aggregated summary is null");
                throw new RuntimeException("Aggregation failed: null summary received from service layer.");
            }
            log.info("Dashboard Summary Aggregation Success");
            return summary;
        } catch (Exception e) {
            log.error("DashboardController CRITICAL ERROR: {}", e.getMessage(), e);
            throw new RuntimeException("Dashboard Aggregation Error: " + e.getMessage());
        }
    }
}

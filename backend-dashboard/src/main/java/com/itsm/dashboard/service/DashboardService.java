package com.itsm.dashboard.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.dashboard.dto.DashboardSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExternalApiService apiService;
    private final ObjectMapper objectMapper; // final로 선언하면 스프링이 주입해줍니다.

    public Mono<DashboardSummaryDTO> getSummary(String role, String companyId, String fromDate, String toDate, String token) {
        
        // If companyId is provided (even for Admin), system stats should reflect that company
        Mono<Map<String, Object>> systemStats = apiService.getSystemStats(companyId, token);
        
        Mono<Map<String, Object>> requestStats = apiService.getRequestStats(companyId, fromDate, toDate, token);

        return Mono.zip(systemStats, requestStats)
                .map(tuple -> {
                    Map<String, Object> sys = tuple.getT1();
                    Map<String, Object> req = tuple.getT2();

                    Map<String, Long> statusMap = objectMapper.convertValue(
                        req.get("statusDistribution"), 
                        new TypeReference<>() {}
                    );
                    
                    return DashboardSummaryDTO.builder()
                            .companyCount(asLong(sys.get("companyCount")))
                            .userCount(asLong(sys.get("userCount")))
                            .totalRequests(asLong(req.get("totalRequests")))
                            .openRequests(asLong(req.get("openRequests")))
                            .inProgressRequests(asLong(req.get("inProgressRequests")))
                            .createdToday(asLong(req.get("createdToday")))
                            .closedToday(asLong(req.get("closedToday")))
                            .statusDistribution(statusMap)
                            .build();
                });
    }

    private long asLong(Object o) {
        if (o instanceof Number) return ((Number) o).longValue();
        if (o instanceof String) {
            try { return Long.parseLong((String) o); } catch (Exception e) { return 0L; }
        }
        return 0L;
    }
}

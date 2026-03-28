package com.itsm.dashboard.service;

import com.itsm.dashboard.dto.DashboardSummaryDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ExternalApiService apiService;

    public Mono<DashboardSummaryDTO> getSummary(String role, String companyId, String token) {
        boolean isAdmin = role.equals("ROLE_ADMIN") || role.equals("ROLE_OPERATOR");
        
        Mono<Map> systemStats = isAdmin ? apiService.getSystemStats(token) 
                : Mono.just(Map.of("companyCount", 0L, "userCount", 0L));
        
        Mono<Map> requestStats = apiService.getRequestStats(isAdmin ? null : companyId, token);

        return Mono.zip(systemStats, requestStats)
                .map(tuple -> {
                    Map sys = tuple.getT1();
                    Map req = tuple.getT2();
                    
                    return DashboardSummaryDTO.builder()
                            .companyCount(asLong(sys.get("companyCount")))
                            .userCount(asLong(sys.get("userCount")))
                            .totalRequests(asLong(req.get("totalRequests")))
                            .openRequests(asLong(req.get("openRequests")))
                            .inProgressRequests(asLong(req.get("inProgressRequests")))
                            .createdToday(asLong(req.get("createdToday")))
                            .closedToday(asLong(req.get("closedToday")))
                            .statusDistribution(asLongMap((Map<String, Object>) req.get("statusDistribution")))
                            .build();
                });
    }

    private Map<String, Long> asLongMap(Map<String, Object> map) {
        if (map == null) return Map.of();
        Map<String, Long> result = new java.util.HashMap<>();
        map.forEach((k, v) -> result.put(k, asLong(v)));
        return result;
    }

    private long asLong(Object o) {
        if (o instanceof Number) return ((Number) o).longValue();
        if (o instanceof String) {
            try { return Long.parseLong((String) o); } catch (Exception e) { return 0L; }
        }
        return 0L;
    }
}

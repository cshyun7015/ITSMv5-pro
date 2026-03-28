package com.itsm.request.controller.stats;

import com.itsm.request.domain.RequestRepository;
import com.itsm.request.dto.stats.RequestStatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/request/stats")
@RequiredArgsConstructor
public class RequestStatsController {

    private final RequestRepository requestRepository;

    @GetMapping("/summary")
    public RequestStatsDTO getSummary(@RequestParam(required = false) String companyId) {
        LocalDateTime startOfDay = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        
        long total;
        long open;
        long inProgress;
        long createdToday;
        long closedToday;

        if (companyId != null && !companyId.isEmpty() && !"SYSTEM".equals(companyId)) {
            total = requestRepository.countByCompanyId(companyId);
            open = requestRepository.countByCompanyIdAndStatus(companyId, "OPEN");
            inProgress = requestRepository.countByCompanyIdAndStatus(companyId, "IN_PROGRESS");
            createdToday = requestRepository.countByCompanyIdAndCreatedAtAfter(companyId, startOfDay);
            closedToday = requestRepository.countByCompanyIdAndUpdatedAtAfterAndStatus(companyId, startOfDay, "CLOSED");
        } else {
            total = requestRepository.count();
            open = requestRepository.countByStatus("OPEN");
            inProgress = requestRepository.countByStatus("IN_PROGRESS");
            createdToday = requestRepository.countByCreatedAtAfter(startOfDay);
            closedToday = requestRepository.countByUpdatedAtAfterAndStatus(startOfDay, "CLOSED");
        }

        return RequestStatsDTO.builder()
                .totalRequests(total)
                .openRequests(open)
                .inProgressRequests(inProgress)
                .createdToday(createdToday)
                .closedToday(closedToday)
                .statusDistribution(fetchStatusDistribution(companyId))
                .priorityDistribution(new HashMap<>()) // Placeholder for now
                .build();
    }

    private Map<String, Long> fetchStatusDistribution(String companyId) {
        // Simplified Logic: In a real app, use a @Query for performance
        Map<String, Long> dist = new HashMap<>();
        String[] statuses = {"OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED", "CANCELLED"};
        for (String s : statuses) {
            long count = (companyId != null && !companyId.isEmpty() && !"SYSTEM".equals(companyId)) 
                    ? requestRepository.countByCompanyIdAndStatus(companyId, s)
                    : requestRepository.countByStatus(s);
            dist.put(s, count);
        }
        return dist;
    }
}

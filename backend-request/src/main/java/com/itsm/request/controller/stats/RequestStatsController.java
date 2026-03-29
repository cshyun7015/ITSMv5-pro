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
    public RequestStatsDTO getSummary(
            @RequestParam(required = false) String companyId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate) {
        
        LocalDateTime start = (fromDate != null && !fromDate.isEmpty()) 
                ? LocalDate.parse(fromDate).atStartOfDay() 
                : LocalDateTime.now().minusDays(30);
        LocalDateTime end = (toDate != null && !toDate.isEmpty()) 
                ? LocalDate.parse(toDate).atTime(LocalTime.MAX) 
                : LocalDateTime.now();
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIN);
        
        long total;
        long open;
        long inProgress;
        long createdToday;
        long closedToday;

        boolean isFilteredCompany = companyId != null && !companyId.isEmpty() && !"SYSTEM".equals(companyId);

        if (isFilteredCompany) {
            total = requestRepository.countByCompanyIdAndCreatedAtBetween(companyId, start, end);
            open = requestRepository.countByCompanyIdAndStatusAndCreatedAtBetween(companyId, "OPEN", start, end);
            inProgress = requestRepository.countByCompanyIdAndStatusAndCreatedAtBetween(companyId, "IN_PROGRESS", start, end);
            createdToday = requestRepository.countByCompanyIdAndCreatedAtAfter(companyId, todayStart);
            closedToday = requestRepository.countByCompanyIdAndUpdatedAtAfterAndStatus(companyId, todayStart, "CLOSED");
        } else {
            total = requestRepository.countByCreatedAtBetween(start, end);
            open = requestRepository.countByStatusAndCreatedAtBetween("OPEN", start, end);
            inProgress = requestRepository.countByStatusAndCreatedAtBetween("IN_PROGRESS", start, end);
            createdToday = requestRepository.countByCreatedAtAfter(todayStart);
            closedToday = requestRepository.countByUpdatedAtAfterAndStatus(todayStart, "CLOSED");
        }

        return RequestStatsDTO.builder()
                .totalRequests(total)
                .openRequests(open)
                .inProgressRequests(inProgress)
                .createdToday(createdToday)
                .closedToday(closedToday)
                .statusDistribution(fetchStatusDistribution(companyId, start, end))
                .priorityDistribution(new HashMap<>())
                .build();
    }

    private Map<String, Long> fetchStatusDistribution(String companyId, LocalDateTime start, LocalDateTime end) {
        Map<String, Long> dist = new HashMap<>();
        String[] statuses = {"OPEN", "IN_PROGRESS", "PENDING", "RESOLVED", "CLOSED", "CANCELLED"};
        boolean isFilteredCompany = companyId != null && !companyId.isEmpty() && !"SYSTEM".equals(companyId);

        for (String s : statuses) {
            long count = isFilteredCompany 
                    ? requestRepository.countByCompanyIdAndStatusAndCreatedAtBetween(companyId, s, start, end)
                    : requestRepository.countByStatusAndCreatedAtBetween(s, start, end);
            dist.put(s, count);
        }
        return dist;
    }
}

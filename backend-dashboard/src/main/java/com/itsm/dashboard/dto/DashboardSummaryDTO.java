package com.itsm.dashboard.dto;

import lombok.*;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class DashboardSummaryDTO {
    private long companyCount;
    private long userCount;
    private long totalRequests;
    private long openRequests;
    private long inProgressRequests;
    private long createdToday;
    private long closedToday;
    private Map<String, Long> statusDistribution;
}

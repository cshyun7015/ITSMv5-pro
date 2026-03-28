package com.itsm.request.dto.stats;

import lombok.*;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestStatsDTO {
    private long totalRequests;
    private long openRequests;
    private long inProgressRequests;
    private long closedToday;
    private long createdToday;
    private Map<String, Long> statusDistribution;
    private Map<String, Long> priorityDistribution;
}

package com.itsm.incident.dto;

import com.itsm.incident.domain.types.*;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncidentDTO {
    private Long id;
    private String incidentId;
    private String title;
    private String description;
    private String tenantId;
    
    private String categoryId;
    private String subCategoryId;
    private String serviceId;
    private String ciId;
    
    private IncidentImpact impact;
    private IncidentUrgency urgency;
    private IncidentPriority priority;
    private IncidentStatus status;
    private String onHoldReason;
    
    private String requesterId;
    private String assigneeId;
    private String assignmentGroupId;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime slaDueDate;
    private boolean isSlaBreached;
    
    private String traceId;
    private String eventId;
    
    private String resolutionCode;
    private String workaround;
}

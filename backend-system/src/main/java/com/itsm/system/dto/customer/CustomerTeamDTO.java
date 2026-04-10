package com.itsm.system.dto.customer;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerTeamDTO {
    private Long id;
    private Long customerCompanyId;
    private String customerCompanyName;
    private Long parentTeamId;
    private String parentTeamName;
    private String name;
    private String description;
    private String costCenter;
    private String serviceHours;
    private String status;
    private String tenantId;
    
    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}

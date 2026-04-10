package com.itsm.system.dto.operator;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorTeamDTO {
    private Long id;
    private Long operatorCompanyId;
    private String operatorCompanyName;
    private String name;
    private String description;
    private String status;
    private String tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}

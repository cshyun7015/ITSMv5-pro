package com.itsm.system.dto.operator;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorCompanyDTO {
    private Long id;
    private String operatorCompanyId;
    private String name;
    private String businessNumber;
    private String representativeName;
    private String status;
    private Integer teamCount;
    private Integer operatorCount;
    private String description;
    private String tenantId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}

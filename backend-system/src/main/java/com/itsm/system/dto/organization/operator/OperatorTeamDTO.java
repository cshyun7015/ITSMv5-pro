package com.itsm.system.dto.organization.operator;

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
    private LocalDateTime createdAt;
}

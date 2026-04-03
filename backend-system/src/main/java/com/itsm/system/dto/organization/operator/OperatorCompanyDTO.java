package com.itsm.system.dto.organization.operator;

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
    private String status;
    private LocalDateTime createdAt;
}

package com.itsm.system.dto.organization.customer;

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
    private String name;
    private String description;
    private LocalDateTime createdAt;
}

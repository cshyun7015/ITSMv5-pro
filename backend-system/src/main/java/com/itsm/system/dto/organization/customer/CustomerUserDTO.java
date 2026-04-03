package com.itsm.system.dto.organization.customer;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerUserDTO {
    private Long id;
    private Long customerTeamId;
    private String customerTeamName;
    private String customerCompanyName;
    private String userId;
    private String name;
    private String email;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
}

package com.itsm.system.dto.customer;

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
    private String password;
    private String name;
    private String email;
    private String position;
    private String role;
    private Boolean isActive;
    private Boolean isVip;
    private Boolean isApprover;
    private String userCriticality;
    private String tenantId;
    
    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}

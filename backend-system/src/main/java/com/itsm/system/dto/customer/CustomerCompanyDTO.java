package com.itsm.system.dto.customer;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerCompanyDTO {
    private Long id;
    private String customerId;
    private String name;
    private String businessNumber;
    private String representativeName;
    private String phone;
    private String email;
    private String address;
    private String status;
    private String tenantId;
    private Boolean isDeleted;
    
    // Audit fields
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
}

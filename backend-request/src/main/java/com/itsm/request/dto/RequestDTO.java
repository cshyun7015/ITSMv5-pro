package com.itsm.request.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestDTO {
    private Long id;
    private String reqNumber;
    private String companyId;
    private String title;
    private String description;
    private String status;
    private String priority;
    private String requesterId;
    private String assigneeId;
    private String serviceId;
    private LocalDateTime slaTargetAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

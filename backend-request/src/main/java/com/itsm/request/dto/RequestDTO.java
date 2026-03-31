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
    private String srTypeCode;
    private String srCategoryCode;
    private String srImpactCode;
    private String srUrgencyCode;
    private String srSourceCode;
    private String srResolutionCode;
    private String resolutionText;
    private String requesterId;
    private String assigneeId;
    private String serviceId;
    private String ciId;
    private LocalDateTime slaTargetAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private Integer reopenCount;
    private LocalDateTime expectedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private java.util.List<AttachmentDTO> attachments;
}

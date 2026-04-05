package com.itsm.request.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RequestHistoryDTO {
    private Long id;
    private Long requestId;
    private String fieldName;
    private String oldValue;
    private String newValue;
    private String action;
    private String changedBy;
    private LocalDateTime createdAt;
}

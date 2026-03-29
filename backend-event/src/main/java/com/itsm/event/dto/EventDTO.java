package com.itsm.event.dto;

import com.itsm.event.domain.Event;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventDTO {
    private Long id;
    private String eventNumber;
    private String companyId;
    private String sourceCode;
    private String node;
    private String severityCode;
    private String message;
    private String statusCode;
    private String relatedRequestId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EventDTO fromEntity(Event entity) {
        return EventDTO.builder()
                .id(entity.getId())
                .eventNumber(entity.getEventNumber())
                .companyId(entity.getCompanyId())
                .sourceCode(entity.getSourceCode())
                .node(entity.getNode())
                .severityCode(entity.getSeverityCode())
                .message(entity.getMessage())
                .statusCode(entity.getStatusCode())
                .relatedRequestId(entity.getRelatedRequestId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public static Event toEntity(EventDTO dto) {
        return Event.builder()
                .id(dto.getId())
                .eventNumber(dto.getEventNumber())
                .companyId(dto.getCompanyId())
                .sourceCode(dto.getSourceCode())
                .node(dto.getNode())
                .severityCode(dto.getSeverityCode())
                .message(dto.getMessage())
                .statusCode(dto.getStatusCode())
                .relatedRequestId(dto.getRelatedRequestId())
                .build();
    }
}

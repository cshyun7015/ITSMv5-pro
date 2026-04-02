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
    private String categoryCode;
    private String node;
    private String severityCode;
    private String message;
    private String eventDetails;
    private String statusCode;
    private String fingerprint;
    private String relatedRequestId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static EventDTO fromEntity(Event entity) {
        return EventDTO.builder()
                .id(entity.getId())
                .eventNumber(entity.getEventNumber())
                .companyId(entity.getCompanyId())
                .sourceCode(entity.getSourceCode())
                .categoryCode(entity.getCategoryCode())
                .node(entity.getNode())
                .severityCode(entity.getSeverityCode())
                .message(entity.getMessage())
                .eventDetails(entity.getEventDetails())
                .statusCode(entity.getStatusCode())
                .fingerprint(entity.getFingerprint())
                .relatedRequestId(entity.getRelatedRequestId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Event toEntity() {
        return Event.builder()
                .id(this.id)
                .eventNumber(this.eventNumber)
                .companyId(this.companyId)
                .sourceCode(this.sourceCode)
                .categoryCode(this.categoryCode)
                .node(this.node)
                .severityCode(this.severityCode)
                .message(this.message)
                .eventDetails(this.eventDetails)
                .statusCode(this.statusCode != null ? this.statusCode : "NEW")
                .fingerprint(this.fingerprint)
                .relatedRequestId(this.relatedRequestId)
                .build();
    }
}

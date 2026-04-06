package com.itsm.incident.domain;

import com.itsm.incident.domain.types.*;
import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "incidents")
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Incident {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String incidentId; // External ID: INC-YYYYMMDD-XXXX

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String tenantId;

    // Classification
    private String categoryId;
    private String subCategoryId;
    private String serviceId;
    private String ciId;
    private String mspId;

    @Enumerated(EnumType.STRING)
    private IncidentChannel channel;

    @Enumerated(EnumType.STRING)
    private IncidentImpact impact;

    @Enumerated(EnumType.STRING)
    private IncidentUrgency urgency;

    @Enumerated(EnumType.STRING)
    private IncidentPriority priority;

    @Builder.Default
    private boolean isMajorIncident = false;

    // Status
    @Enumerated(EnumType.STRING)
    private IncidentStatus status;

    private String onHoldReason;

    // Stakeholders
    private String requesterId;
    private String affectedUserId;
    private String assigneeId;
    private String assignmentGroupId;

    // Temporal & SLA
    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime slaDueDate;
    private boolean isSlaBreached;

    // Observability
    private String traceId;
    private String eventId;

    // Resolution
    private String resolutionCode;
    @Column(columnDefinition = "TEXT")
    private String workaround;

    @PrePersist
    @PreUpdate
    public void calculatePriority() {
        // If it's a major incident, it's always P1
        if (isMajorIncident) {
            this.priority = IncidentPriority.P1;
        } else if (impact != null && urgency != null) {
            if (impact == IncidentImpact.HIGH && urgency == IncidentUrgency.HIGH) {
                this.priority = IncidentPriority.P1;
            } else if ((impact == IncidentImpact.HIGH && urgency == IncidentUrgency.MEDIUM) ||
                       (impact == IncidentImpact.MEDIUM && urgency == IncidentUrgency.HIGH)) {
                this.priority = IncidentPriority.P2;
            } else if ((impact == IncidentImpact.HIGH && urgency == IncidentUrgency.LOW) ||
                       (impact == IncidentImpact.MEDIUM && urgency == IncidentUrgency.MEDIUM) ||
                       (impact == IncidentImpact.LOW && urgency == IncidentUrgency.HIGH)) {
                this.priority = IncidentPriority.P3;
            } else {
                this.priority = IncidentPriority.P4;
            }
        }
        
        // Auto-calculate SLA Due Date if P1/P2/P3/P4
        if (this.priority != null && this.createdAt != null && this.slaDueDate == null) {
            long hoursToAdd = switch (this.priority) {
                case P1 -> 4;
                case P2 -> 8;
                case P3 -> 24;
                case P4 -> 48;
            };
            this.slaDueDate = this.createdAt.plusHours(hoursToAdd);
        }
    }
}

package com.itsm.event.domain;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "events")
@EntityListeners(AuditingEntityListener.class)
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "event_number", nullable = false, unique = true)
    private String eventNumber;

    @Column(name = "company_id", nullable = false)
    private String companyId;

    @Column(name = "source_code", nullable = false)
    private String sourceCode;

    @Column(name = "category_code")
    private String categoryCode;

    @Column(name = "node")
    private String node;

    @Column(name = "severity_code", nullable = false)
    private String severityCode;

    @Column(name = "message", nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "event_details", columnDefinition = "LONGTEXT")
    private String eventDetails;

    @Column(name = "status_code")
    private String statusCode;

    @Column(name = "fingerprint")
    private String fingerprint;

    @Column(name = "occurrence_count")
    private Integer occurrenceCount;

    @Column(name = "first_occurred_at")
    private LocalDateTime firstOccurredAt;

    @Column(name = "last_occurred_at")
    private LocalDateTime lastOccurredAt;

    @Column(name = "assignee_id")
    private String assigneeId;

    @Column(name = "acknowledged_at")
    private LocalDateTime acknowledgedAt;

    @Column(name = "related_request_id")
    private String relatedRequestId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

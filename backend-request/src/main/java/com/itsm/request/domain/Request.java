package com.itsm.request.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "requests", schema = "request_mgmt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Request {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "req_number", nullable = false, unique = true, length = 50)
    private String reqNumber;

    @Column(name = "company_id", nullable = false, length = 50)
    private String companyId;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "status", length = 50)
    private String status;

    @Column(name = "priority", length = 50)
    private String priority;

    @Column(name = "sr_type_code", length = 50)
    private String srTypeCode;

    @Column(name = "sr_category_code", length = 50)
    private String srCategoryCode;

    @Column(name = "sr_impact_code", length = 50)
    private String srImpactCode;

    @Column(name = "sr_urgency_code", length = 50)
    private String srUrgencyCode;

    @Column(name = "sr_source_code", length = 50)
    private String srSourceCode;

    @Column(name = "sr_resolution_code", length = 50)
    private String srResolutionCode;

    @Column(name = "resolution_text", columnDefinition = "TEXT")
    private String resolutionText;

    @Column(name = "requester_id", nullable = false, length = 50)
    private String requesterId;

    @Column(name = "assignee_id", length = 50)
    private String assigneeId;

    @Column(name = "service_id", length = 50)
    private String serviceId;

    @Column(name = "ci_id", length = 100)
    private String ciId;

    @Column(name = "sla_target_at")
    private LocalDateTime slaTargetAt;

    @Column(name = "resolved_at", updatable = false)
    private LocalDateTime resolvedAt;

    @Column(name = "closed_at", updatable = false)
    private LocalDateTime closedAt;

    @Builder.Default
    @Column(name = "reopen_count", updatable = false)
    private Integer reopenCount = 0;

    @Column(name = "expected_at")
    private LocalDateTime expectedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RequestComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Attachment> attachments = new ArrayList<>();
}

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

    @Column(name = "requester_id", nullable = false, length = 50)
    private String requesterId;

    @Column(name = "assignee_id", length = 50)
    private String assigneeId;

    @Column(name = "service_id", length = 50)
    private String serviceId;

    @Column(name = "sla_target_at")
    private LocalDateTime slaTargetAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RequestComment> comments = new ArrayList<>();
}

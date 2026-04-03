package com.itsm.system.domain.organization.operator;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "operator_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorCompany {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operator_company_id", nullable = false, unique = true, length = 50)
    private String operatorCompanyId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "business_number", length = 50)
    private String businessNumber;

    @Column(length = 20)
    private String status;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}

package com.itsm.system.domain.organization.operator;

import com.itsm.system.domain.common.BaseEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "operator_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE operator_companies SET is_deleted = 1 WHERE id = ?")
@SQLRestriction("is_deleted = 0")
public class OperatorCompany extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "operator_company_id", nullable = false, unique = true, length = 50)
    private String operatorCompanyId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "business_number", length = 50)
    private String businessNumber;

    @Column(name = "representative_name", length = 100)
    private String representativeName;

    @Column(length = 20)
    private String status;

    @Builder.Default
    @Column(name = "is_deleted")
    private Integer isDeleted = 0;
}

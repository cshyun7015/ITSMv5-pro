package com.itsm.system.domain.organization.customer;

import com.itsm.system.domain.common.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE customer_companies SET is_deleted = 1 WHERE id = ?")
public class CustomerCompany extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToMany(mappedBy = "customerCompany", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomerTeam> teams = new ArrayList<>();

    @Column(name = "customer_id", nullable = false, unique = true, length = 50)
    private String customerId;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(name = "business_number", length = 50)
    private String businessNumber;

    @Column(name = "representative_name", length = 100)
    private String representativeName;

    @Column(length = 50)
    private String phone;

    @Column(length = 100)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(length = 20)
    private String status; // ACTIVE, INACTIVE
}

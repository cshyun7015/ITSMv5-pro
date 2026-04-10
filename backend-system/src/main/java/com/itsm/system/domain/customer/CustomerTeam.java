package com.itsm.system.domain.customer;

import com.itsm.system.domain.common.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "customer_teams")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE customer_teams SET is_deleted = 1 WHERE id = ?")
public class CustomerTeam extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_company_id")
    private CustomerCompany customerCompany;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_team_id")
    private CustomerTeam parentTeam;

    @OneToMany(mappedBy = "parentTeam", cascade = CascadeType.ALL)
    @Builder.Default
    private List<CustomerTeam> subTeams = new ArrayList<>();

    @OneToMany(mappedBy = "customerTeam", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CustomerUser> users = new ArrayList<>();

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "cost_center", length = 50)
    private String costCenter;

    @Column(name = "service_hours", length = 100)
    private String serviceHours;

    @Column(length = 20)
    private String status;
}

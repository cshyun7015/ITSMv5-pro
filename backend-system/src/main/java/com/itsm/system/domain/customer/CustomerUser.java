package com.itsm.system.domain.organization.customer;

import com.itsm.system.domain.common.BaseTenantEntity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name = "customer_users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE customer_users SET is_deleted = 1 WHERE id = ?")
public class CustomerUser extends BaseTenantEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_team_id")
    private CustomerTeam customerTeam;

    @Column(name = "user_id", nullable = false, unique = true, length = 50)
    private String userId;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String email;

    @Column(length = 50)
    private String position;

    @Column(length = 50)
    private String role; // ROLE_USER, ROLE_ADMIN, etc.

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_vip")
    @Builder.Default
    private Boolean isVip = false;

    @Column(name = "is_approver")
    @Builder.Default
    private Boolean isApprover = false;

    @Column(name = "user_criticality", length = 20)
    private String userCriticality; // HIGH, MEDIUM, LOW
}

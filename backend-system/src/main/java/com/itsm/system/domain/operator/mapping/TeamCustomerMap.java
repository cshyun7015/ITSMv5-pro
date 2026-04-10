package com.itsm.system.domain.operator.mapping;

import com.itsm.system.domain.customer.CustomerCompany;
import com.itsm.system.domain.operator.OperatorTeam;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "team_customer_map")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamCustomerMap {

    @EmbeddedId
    private TeamCustomerMapId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("operatorTeamId")
    @JoinColumn(name = "operator_team_id")
    private OperatorTeam operatorTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("customerCompanyId")
    @JoinColumn(name = "customer_company_id")
    private CustomerCompany customerCompany;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class TeamCustomerMapId implements Serializable {
        private Long operatorTeamId;
        private Long customerCompanyId;
    }
}

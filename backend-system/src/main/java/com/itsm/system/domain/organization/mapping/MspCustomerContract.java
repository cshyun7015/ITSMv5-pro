package com.itsm.system.domain.organization.mapping;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.operator.OperatorCompany;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDate;

@Entity
@Table(name = "msp_customer_contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MspCustomerContract {

    @EmbeddedId
    private MspCustomerContractId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("operatorCompanyId")
    @JoinColumn(name = "operator_company_id")
    private OperatorCompany operatorCompany;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("customerCompanyId")
    @JoinColumn(name = "customer_company_id")
    private CustomerCompany customerCompany;

    @Column(name = "contract_date")
    private LocalDate contractDate;

    @Column(name = "is_active")
    private Boolean isActive;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class MspCustomerContractId implements Serializable {
        private Long operatorCompanyId;
        private Long customerCompanyId;
    }
}

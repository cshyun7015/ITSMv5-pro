package com.itsm.system.repository.operator.mapping;

import com.itsm.system.domain.organization.mapping.MspCustomerContract;
import com.itsm.system.domain.organization.mapping.MspCustomerContract.MspCustomerContractId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MspCustomerContractRepository extends JpaRepository<MspCustomerContract, MspCustomerContractId> {
    List<MspCustomerContract> findByOperatorCompanyId(Long operatorCompanyId);
    List<MspCustomerContract> findByCustomerCompanyId(Long customerCompanyId);
}

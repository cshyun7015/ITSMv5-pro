package com.itsm.system.repository.organization.operator;

import com.itsm.system.domain.organization.operator.OperatorCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperatorCompanyRepository extends JpaRepository<OperatorCompany, Long> {
    Optional<OperatorCompany> findByOperatorCompanyId(String operatorCompanyId);
}

package com.itsm.system.repository.operator;

import com.itsm.system.domain.operator.OperatorTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperatorTeamRepository extends JpaRepository<OperatorTeam, Long> {
    List<OperatorTeam> findByOperatorCompany_Id(Long operatorCompanyId);
    long countByOperatorCompany_Id(Long operatorCompanyId);
}

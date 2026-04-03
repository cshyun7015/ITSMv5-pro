package com.itsm.system.repository.organization.operator;

import com.itsm.system.domain.organization.operator.OperatorTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperatorTeamRepository extends JpaRepository<OperatorTeam, Long> {
    List<OperatorTeam> findByOperatorCompanyId(Long operatorCompanyId);
}

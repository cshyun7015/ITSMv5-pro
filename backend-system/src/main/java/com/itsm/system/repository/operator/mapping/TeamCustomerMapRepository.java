package com.itsm.system.repository.operator.mapping;

import com.itsm.system.domain.operator.mapping.TeamCustomerMap;
import com.itsm.system.domain.operator.mapping.TeamCustomerMap.TeamCustomerMapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamCustomerMapRepository extends JpaRepository<TeamCustomerMap, TeamCustomerMapId> {
    List<TeamCustomerMap> findByOperatorTeamId(Long operatorTeamId);
    List<TeamCustomerMap> findByCustomerCompanyId(Long customerCompanyId);
}

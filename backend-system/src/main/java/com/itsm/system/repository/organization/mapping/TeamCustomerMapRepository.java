package com.itsm.system.repository.organization.mapping;

import com.itsm.system.domain.organization.mapping.TeamCustomerMap;
import com.itsm.system.domain.organization.mapping.TeamCustomerMap.TeamCustomerMapId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TeamCustomerMapRepository extends JpaRepository<TeamCustomerMap, TeamCustomerMapId> {
    List<TeamCustomerMap> findByOperatorTeamId(Long operatorTeamId);
    List<TeamCustomerMap> findByCustomerCompanyId(Long customerCompanyId);
}

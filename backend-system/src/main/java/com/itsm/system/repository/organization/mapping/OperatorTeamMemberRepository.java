package com.itsm.system.repository.organization.mapping;

import com.itsm.system.domain.organization.mapping.OperatorTeamMember;
import com.itsm.system.domain.organization.mapping.OperatorTeamMember.OperatorTeamMemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OperatorTeamMemberRepository extends JpaRepository<OperatorTeamMember, OperatorTeamMemberId> {
    List<OperatorTeamMember> findByOperatorId(Long operatorId);
    List<OperatorTeamMember> findByOperatorTeamId(Long operatorTeamId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(tm) FROM OperatorTeamMember tm WHERE tm.operatorTeam.operatorCompany.id = :companyId")
    long countByCompanyId(Long companyId);
}

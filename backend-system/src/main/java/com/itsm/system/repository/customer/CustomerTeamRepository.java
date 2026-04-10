package com.itsm.system.repository.customer;

import com.itsm.system.domain.customer.CustomerTeam;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerTeamRepository extends JpaRepository<CustomerTeam, Long>, QuerydslPredicateExecutor<CustomerTeam> {
    List<CustomerTeam> findByCustomerCompanyId(Long customerCompanyId);
}

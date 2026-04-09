package com.itsm.system.repository.customer;

import com.itsm.system.domain.organization.customer.CustomerUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerUserRepository extends JpaRepository<CustomerUser, Long>, QuerydslPredicateExecutor<CustomerUser> {
    Optional<CustomerUser> findByUserId(String userId);
    List<CustomerUser> findByCustomerTeamId(Long customerTeamId);
    boolean existsByUserId(String userId);
    long countByCustomerTeamCustomerCompanyCustomerId(String customerId);
}

package com.itsm.system.repository.organization.customer;

import com.itsm.system.domain.organization.customer.CustomerUser;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerUserRepository extends JpaRepository<CustomerUser, Long> {
    Optional<CustomerUser> findByUserId(String userId);
    List<CustomerUser> findByCustomerTeamId(Long customerTeamId);
    boolean existsByUserId(String userId);
    long countByCustomerTeamCustomerCompanyCustomerId(String customerId);
}

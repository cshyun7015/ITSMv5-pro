package com.itsm.system.repository.organization.customer;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerCompanyRepository extends JpaRepository<CustomerCompany, Long> {
    Optional<CustomerCompany> findByCustomerId(String customerId);
}

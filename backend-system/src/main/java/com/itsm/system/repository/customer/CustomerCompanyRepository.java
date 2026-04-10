package com.itsm.system.repository.customer;

import com.itsm.system.domain.customer.CustomerCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CustomerCompanyRepository extends JpaRepository<CustomerCompany, Long>, QuerydslPredicateExecutor<CustomerCompany> {
    Optional<CustomerCompany> findByCustomerId(String customerId);
}

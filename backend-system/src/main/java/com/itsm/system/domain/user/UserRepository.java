package com.itsm.system.domain.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {
    Optional<User> findByUserId(String userId);

    List<User> findByCompanyId(String companyId);
    long countByCompanyId(String companyId);

    boolean existsByUserId(String userId);
}

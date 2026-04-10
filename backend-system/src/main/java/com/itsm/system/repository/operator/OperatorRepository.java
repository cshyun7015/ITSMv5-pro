package com.itsm.system.repository.operator;

import com.itsm.system.domain.operator.Operator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OperatorRepository extends JpaRepository<Operator, Long> {
    Optional<Operator> findByUserId(String userId);
    boolean existsByUserId(String userId);
}

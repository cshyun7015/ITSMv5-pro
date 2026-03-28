package com.itsm.request.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByCompanyId(String companyId);
    List<Request> findByCompanyIdOrderByCreatedAtDesc(String companyId);
    
    long countByCompanyId(String companyId);
    long countByStatus(String status);
    long countByCompanyIdAndStatus(String companyId, String status);
    
    long countByCreatedAtAfter(LocalDateTime dateTime);
    long countByCompanyIdAndCreatedAtAfter(String companyId, LocalDateTime dateTime);
    
    long countByUpdatedAtAfterAndStatus(LocalDateTime dateTime, String status);
    long countByCompanyIdAndUpdatedAtAfterAndStatus(String companyId, LocalDateTime dateTime, String status);
}

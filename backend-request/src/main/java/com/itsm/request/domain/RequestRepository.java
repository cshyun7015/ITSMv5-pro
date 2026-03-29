package com.itsm.request.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RequestRepository extends JpaRepository<Request, Long> {
    List<Request> findByCompanyId(String companyId);
    List<Request> findByCompanyIdOrderByCreatedAtDesc(String companyId);
    List<Request> findAllByOrderByCreatedAtDesc();
    
    Request findTopByReqNumberStartingWithOrderByReqNumberDesc(String prefix);
    
    long countByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    long countByCompanyIdAndCreatedAtBetween(String companyId, LocalDateTime start, LocalDateTime end);
    
    long countByStatusAndCreatedAtBetween(String status, LocalDateTime start, LocalDateTime end);
    long countByCompanyIdAndStatusAndCreatedAtBetween(String companyId, String status, LocalDateTime start, LocalDateTime end);
    
    long countByUpdatedAtBetweenAndStatus(LocalDateTime start, LocalDateTime end, String status);
    long countByCompanyIdAndUpdatedAtBetweenAndStatus(String companyId, LocalDateTime start, LocalDateTime end, String status);
    
    long countByCreatedAtAfter(LocalDateTime dateTime);
    long countByCompanyIdAndCreatedAtAfter(String companyId, LocalDateTime dateTime);
    
    long countByUpdatedAtAfterAndStatus(LocalDateTime dateTime, String status);
    long countByCompanyIdAndUpdatedAtAfterAndStatus(String companyId, LocalDateTime dateTime, String status);
}

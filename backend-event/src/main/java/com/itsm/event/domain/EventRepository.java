package com.itsm.event.domain;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.Optional;

@Repository
public interface EventRepository extends JpaRepository<Event, Long>, JpaSpecificationExecutor<Event> {

    Page<Event> findByCompanyId(String companyId, Pageable pageable);

    // Sequence generator helper
    long countByCreatedAtAfter(LocalDateTime startOfMonth);

    // Find the latest active event by fingerprint to resolve it
    Optional<Event> findFirstByFingerprintAndStatusCodeInOrderByCreatedAtDesc(String fingerprint, Collection<String> statusCodes);
}

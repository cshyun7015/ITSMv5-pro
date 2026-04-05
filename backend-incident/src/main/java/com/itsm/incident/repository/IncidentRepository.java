package com.itsm.incident.repository;

import com.itsm.incident.domain.Incident;
import com.itsm.incident.domain.types.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.Optional;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    Optional<Incident> findByIncidentId(String incidentId);
    Page<Incident> findAllByTenantIdOrderByCreatedAtDesc(String tenantId, Pageable pageable);
    Page<Incident> findByTenantIdAndStatusInOrderByCreatedAtDesc(String tenantId, Collection<IncidentStatus> statuses, Pageable pageable);
}

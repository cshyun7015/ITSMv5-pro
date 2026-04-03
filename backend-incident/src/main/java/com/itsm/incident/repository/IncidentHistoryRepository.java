package com.itsm.incident.repository;

import com.itsm.incident.domain.Incident;
import com.itsm.incident.domain.IncidentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentHistoryRepository extends JpaRepository<IncidentHistory, Long> {
    List<IncidentHistory> findByIncidentOrderByChangedAtDesc(Incident incident);
}

package com.itsm.request.domain;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RequestHistoryRepository extends JpaRepository<RequestHistory, Long> {
    List<RequestHistory> findByRequestIdOrderByCreatedAtDesc(Long requestId);
}

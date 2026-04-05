package com.itsm.incident.service;

import com.itsm.incident.domain.Incident;
import com.itsm.incident.domain.IncidentHistory;
import com.itsm.incident.domain.types.IncidentStatus;
import com.itsm.incident.dto.IncidentDTO;
import com.itsm.incident.repository.IncidentHistoryRepository;
import com.itsm.incident.repository.IncidentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@RequiredArgsConstructor
public class IncidentService {

    private final IncidentRepository repository;
    private final IncidentHistoryRepository historyRepository;

    @Transactional
    public IncidentDTO create(IncidentDTO dto) {
        Incident incident = Incident.builder()
                .incidentId("INC-" + LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd")) + "-" + UUID.randomUUID().toString().substring(0, 4).toUpperCase())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .tenantId(dto.getTenantId())
                .categoryId(dto.getCategoryId())
                .subCategoryId(dto.getSubCategoryId())
                .serviceId(dto.getServiceId())
                .ciId(dto.getCiId())
                .impact(dto.getImpact())
                .urgency(dto.getUrgency())
                .status(IncidentStatus.NEW)
                .requesterId(dto.getRequesterId())
                .assignmentGroupId(dto.getAssignmentGroupId())
                .traceId(dto.getTraceId())
                .eventId(dto.getEventId())
                .build();

        incident = repository.save(incident);
        
        logHistory(incident, "System", "Creation", null, "New Incident Created", "Initial Creation");
        
        return toDTO(incident);
    }

    @Transactional
    public IncidentDTO update(Long id, IncidentDTO dto, String userId) {
        Incident incident = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Incident not found: " + id));
        
        if (incident.getStatus() == IncidentStatus.CLOSED) {
            throw new IllegalStateException("Cannot update a CLOSED incident.");
        }

        // 1. Status Transition Validation
        if (dto.getStatus() != null && dto.getStatus() != incident.getStatus()) {
            if (!incident.getStatus().canTransitionTo(dto.getStatus())) {
                throw new IllegalStateException(String.format("Invalid status transition: %s -> %s", 
                        incident.getStatus(), dto.getStatus()));
            }
            
            logHistory(incident, userId, "Status Change", incident.getStatus().name(), dto.getStatus().name(), "Workflow Progress");
            incident.setStatus(dto.getStatus());
            
            // Auto-timestamp for resolution milestones
            if (dto.getStatus() == IncidentStatus.RESOLVED) {
                incident.setResolvedAt(LocalDateTime.now());
            } else if (dto.getStatus() == IncidentStatus.CLOSED) {
                incident.setClosedAt(LocalDateTime.now());
            }
        }
        
        // 2. Data Synchronization (Assignee, Resolution Info, etc.)

        if (dto.getAssigneeId() != null && !dto.getAssigneeId().equals(incident.getAssigneeId())) {
            logHistory(incident, userId, "Assignee Change", incident.getAssigneeId(), dto.getAssigneeId(), "Manual Assignment");
            incident.setAssigneeId(dto.getAssigneeId());
        }

        if (dto.getTitle() != null) incident.setTitle(dto.getTitle());
        if (dto.getDescription() != null) incident.setDescription(dto.getDescription());
        if (dto.getImpact() != null) incident.setImpact(dto.getImpact());
        if (dto.getUrgency() != null) incident.setUrgency(dto.getUrgency());
        if (dto.getResolutionCode() != null) incident.setResolutionCode(dto.getResolutionCode());
        if (dto.getWorkaround() != null) incident.setWorkaround(dto.getWorkaround());
        if (dto.getOnHoldReason() != null) incident.setOnHoldReason(dto.getOnHoldReason());
        
        // Manual Boolean Check (DTO boolean defaults to false, need to check if provided or if logic allows)
        incident.setMajorIncident(dto.isMajorIncident());

        if (dto.getCategoryId() != null) incident.setCategoryId(dto.getCategoryId());
        if (dto.getSubCategoryId() != null) incident.setSubCategoryId(dto.getSubCategoryId());
        if (dto.getServiceId() != null) incident.setServiceId(dto.getServiceId());
        if (dto.getCiId() != null) incident.setCiId(dto.getCiId());
        
        return toDTO(repository.save(incident));
    }

    public Page<IncidentDTO> getList(String tenantId, Collection<IncidentStatus> statuses, Pageable pageable) {
        Page<Incident> page;
        if (statuses != null && !statuses.isEmpty()) {
            page = repository.findByTenantIdAndStatusInOrderByCreatedAtDesc(tenantId, statuses, pageable);
        } else {
            page = repository.findAllByTenantIdOrderByCreatedAtDesc(tenantId, pageable);
        }
        return page.map(this::toDTO);
    }

    public IncidentDTO getById(Long id) {
        return toDTO(repository.findById(id).orElseThrow());
    }

    private void logHistory(Incident incident, String userId, String subject, String oldVal, String newVal, String reason) {
        historyRepository.save(IncidentHistory.builder()
                .incident(incident)
                .changedBy(userId)
                .changeSubject(subject)
                .oldValue(oldVal)
                .newValue(newVal)
                .changeReason(reason)
                .build());
    }

    private IncidentDTO toDTO(Incident entity) {
        return IncidentDTO.builder()
                .id(entity.getId())
                .incidentId(entity.getIncidentId())
                .title(entity.getTitle())
                .description(entity.getDescription())
                .tenantId(entity.getTenantId())
                .categoryId(entity.getCategoryId())
                .subCategoryId(entity.getSubCategoryId())
                .serviceId(entity.getServiceId())
                .ciId(entity.getCiId())
                .impact(entity.getImpact())
                .urgency(entity.getUrgency())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .onHoldReason(entity.getOnHoldReason())
                .requesterId(entity.getRequesterId())
                .assigneeId(entity.getAssigneeId())
                .assignmentGroupId(entity.getAssignmentGroupId())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .resolvedAt(entity.getResolvedAt())
                .closedAt(entity.getClosedAt())
                .slaDueDate(entity.getSlaDueDate())
                .isSlaBreached(entity.isSlaBreached())
                .traceId(entity.getTraceId())
                .eventId(entity.getEventId())
                .resolutionCode(entity.getResolutionCode())
                .workaround(entity.getWorkaround())
                .build();
    }
}

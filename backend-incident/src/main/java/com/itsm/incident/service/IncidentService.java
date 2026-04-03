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
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

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
        Incident incident = repository.findById(id).orElseThrow();
        
        if (dto.getStatus() != null && dto.getStatus() != incident.getStatus()) {
            logHistory(incident, userId, "Status Change", incident.getStatus().name(), dto.getStatus().name(), "Workflow Step");
            incident.setStatus(dto.getStatus());
            
            if (dto.getStatus() == IncidentStatus.RESOLVED) {
                incident.setResolvedAt(LocalDateTime.now());
            } else if (dto.getStatus() == IncidentStatus.CLOSED) {
                incident.setClosedAt(LocalDateTime.now());
            }
        }
        
        if (dto.getAssigneeId() != null && !dto.getAssigneeId().equals(incident.getAssigneeId())) {
            logHistory(incident, userId, "Assignee Change", incident.getAssigneeId(), dto.getAssigneeId(), "Manual Assignment");
            incident.setAssigneeId(dto.getAssigneeId());
        }

        incident.setTitle(dto.getTitle());
        incident.setDescription(dto.getDescription());
        incident.setImpact(dto.getImpact());
        incident.setUrgency(dto.getUrgency());
        incident.setResolutionCode(dto.getResolutionCode());
        incident.setWorkaround(dto.getWorkaround());
        
        return toDTO(repository.save(incident));
    }

    public List<IncidentDTO> getList(String tenantId) {
        return repository.findByTenantId(tenantId).stream().map(this::toDTO).collect(Collectors.toList());
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

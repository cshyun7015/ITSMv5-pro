package com.itsm.event.service;

import com.itsm.event.domain.Event;
import com.itsm.event.domain.EventRepository;
import com.itsm.event.dto.EventDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final RestTemplate restTemplate;

    @Transactional
    public EventDTO createEvent(EventDTO dto) {
        // 1. Deduplication (Occurrence counting)
        if (dto.getFingerprint() != null && !dto.getFingerprint().isEmpty()) {
            java.util.List<String> activeStatuses = java.util.Arrays.asList("NEW", "ACKNOWLEDGED");
            java.util.Optional<Event> existingEvent = eventRepository.findFirstByFingerprintAndStatusCodeInOrderByCreatedAtDesc(
                    dto.getFingerprint(), activeStatuses);

            if (existingEvent.isPresent()) {
                Event event = existingEvent.get();
                event.setOccurrenceCount(event.getOccurrenceCount() != null ? event.getOccurrenceCount() + 1 : 2);
                event.setLastOccurredAt(LocalDateTime.now());
                if (event.getFirstOccurredAt() == null) {
                    event.setFirstOccurredAt(event.getCreatedAt());
                }
                // Optional: Update message or severity if changed
                event.setSeverityCode(dto.getSeverityCode() != null ? dto.getSeverityCode() : event.getSeverityCode());
                
                return EventDTO.fromEntity(eventRepository.save(event));
            }
        }

        // 2. New Event Creation
        dto.setEventNumber(generateEventNumber());
        if (dto.getStatusCode() == null) {
            dto.setStatusCode("NEW");
        }
        Event entity = dto.toEntity();
        entity.setOccurrenceCount(1);
        entity.setFirstOccurredAt(LocalDateTime.now());
        entity.setLastOccurredAt(LocalDateTime.now());
        
        Event saved = eventRepository.save(entity);
        return EventDTO.fromEntity(saved);
    }

    @Transactional
    public EventDTO acknowledgeEvent(Long id, String userId) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        event.setStatusCode("ACKNOWLEDGED");
        event.setAssigneeId(userId);
        event.setAcknowledgedAt(LocalDateTime.now());
        
        return EventDTO.fromEntity(eventRepository.save(event));
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEventsInScope(String scopeCompanyId, Pageable pageable) {
        // System admin (MSP) sees everything
        if ("MSP".equals(scopeCompanyId)) {
            return eventRepository.findAll(pageable).map(EventDTO::fromEntity);
        } else {
            // Customer user sees only their company's events
            return eventRepository.findByCompanyId(scopeCompanyId, pageable).map(EventDTO::fromEntity);
        }
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEventsByCompany(String companyId, Pageable pageable) {
        // Standard company filter (Return entries ONLY for this specific companyId)
        return eventRepository.findByCompanyId(companyId, pageable).map(EventDTO::fromEntity);
    }

    @Transactional(readOnly = true)
    public EventDTO getEvent(Long id) {
        return eventRepository.findById(id).map(EventDTO::fromEntity)
                .orElseThrow(() -> new RuntimeException("Event not found"));
    }

    @Transactional
    public EventDTO updateEvent(Long id, EventDTO dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));
        
        event.setSourceCode(dto.getSourceCode() != null ? dto.getSourceCode() : event.getSourceCode());
        event.setCategoryCode(dto.getCategoryCode() != null ? dto.getCategoryCode() : event.getCategoryCode());
        event.setNode(dto.getNode() != null ? dto.getNode() : event.getNode());
        event.setSeverityCode(dto.getSeverityCode() != null ? dto.getSeverityCode() : event.getSeverityCode());
        event.setMessage(dto.getMessage() != null ? dto.getMessage() : event.getMessage());
        event.setEventDetails(dto.getEventDetails() != null ? dto.getEventDetails() : event.getEventDetails());
        event.setStatusCode(dto.getStatusCode() != null ? dto.getStatusCode() : event.getStatusCode());
        event.setRelatedRequestId(dto.getRelatedRequestId() != null ? dto.getRelatedRequestId() : event.getRelatedRequestId());

        return EventDTO.fromEntity(eventRepository.save(event));
    }

    @Transactional
    @SuppressWarnings("unchecked")
    public EventDTO promoteToIncident(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"NEW".equals(event.getStatusCode()) && !"ACKNOWLEDGED".equals(event.getStatusCode())) {
            throw new RuntimeException("Only NEW or ACKNOWLEDGED events can be promoted");
        }

        // Prepare Incident Body
        Map<String, Object> incidentBody = new HashMap<>();
        incidentBody.put("title", "[Escalated] " + event.getMessage());
        incidentBody.put("description", String.format(
            "--- Escalated from Event Management ---\n" +
            "Event Number: %s\n" +
            "Source: %s\n" +
            "Node: %s\n" +
            "Severity: %s\n" +
            "Details: %s", 
            event.getEventNumber(), event.getSourceCode(), event.getNode(), 
            event.getSeverityCode(), event.getEventDetails()));
        
        incidentBody.put("tenantId", event.getCompanyId());
        incidentBody.put("requesterId", "system-event-mgr");
        incidentBody.put("eventId", event.getEventNumber());
        
        // Severity Mapping to Impact/Urgency
        String severity = event.getSeverityCode() != null ? event.getSeverityCode().toUpperCase() : "INFO";
        if ("CRITICAL".equals(severity)) {
            incidentBody.put("impact", "HIGH");
            incidentBody.put("urgency", "HIGH");
        } else if ("ERROR".equals(severity)) {
            incidentBody.put("impact", "MEDIUM");
            incidentBody.put("urgency", "HIGH");
        } else if ("WARNING".equals(severity)) {
            incidentBody.put("impact", "MEDIUM");
            incidentBody.put("urgency", "MEDIUM");
        } else {
            incidentBody.put("impact", "LOW");
            incidentBody.put("urgency", "LOW");
        }
        
        incidentBody.put("status", "NEW");
        incidentBody.put("channel", "MONITORING");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(incidentBody, headers);

        try {
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                    "http://incident-service:8080/api/v1/incident", httpEntity, (Class<Map<String, Object>>) (Class<?>) Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String incNumber = (String) response.getBody().get("incidentId");
                event.setRelatedRequestId(incNumber);
                event.setStatusCode("PROMOTED");
                return EventDTO.fromEntity(eventRepository.save(event));
            } else {
                throw new RuntimeException("Failed to create record in incident-service");
            }
        } catch (Exception e) {
            throw new RuntimeException("Escalation failed: Connectivity issue with incident-service (" + e.getMessage() + ")");
        }
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    @Transactional
    public void resolveEventByFingerprint(String fingerprint) {
        if (fingerprint == null || fingerprint.isEmpty()) return;

        // Find the latest active event with this fingerprint
        java.util.List<String> activeStatuses = java.util.Arrays.asList("NEW", "ACKNOWLEDGED");
        eventRepository.findFirstByFingerprintAndStatusCodeInOrderByCreatedAtDesc(fingerprint, activeStatuses)
                .ifPresent(event -> {
                    event.setStatusCode("RESOLVED");
                    eventRepository.save(event);
                });
    }

    private synchronized String generateEventNumber() {
        YearMonth currentYearMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYearMonth.atDay(1).atStartOfDay();
        long currentCount = eventRepository.countByCreatedAtAfter(startOfMonth);
        String yyyyMM = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        return String.format("EV-%s-%05d", yyyyMM, currentCount + 1);
    }
}

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
        dto.setEventNumber(generateEventNumber());
        if (dto.getStatusCode() == null) {
            dto.setStatusCode("NEW");
        }
        Event entity = EventDTO.toEntity(dto);
        Event saved = eventRepository.save(entity);
        return EventDTO.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<EventDTO> getEvents(String companyId, Pageable pageable) {
        if ("MSP".equals(companyId)) {
            return eventRepository.findAll(pageable).map(EventDTO::fromEntity);
        } else {
            return eventRepository.findByCompanyId(companyId, pageable).map(EventDTO::fromEntity);
        }
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
        event.setNode(dto.getNode() != null ? dto.getNode() : event.getNode());
        event.setSeverityCode(dto.getSeverityCode() != null ? dto.getSeverityCode() : event.getSeverityCode());
        event.setMessage(dto.getMessage() != null ? dto.getMessage() : event.getMessage());
        event.setStatusCode(dto.getStatusCode() != null ? dto.getStatusCode() : event.getStatusCode());
        event.setRelatedRequestId(dto.getRelatedRequestId() != null ? dto.getRelatedRequestId() : event.getRelatedRequestId());

        return EventDTO.fromEntity(eventRepository.save(event));
    }

    @Transactional
    public EventDTO promoteToIncident(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!"NEW".equals(event.getStatusCode()) && !"ACKNOWLEDGED".equals(event.getStatusCode())) {
            throw new RuntimeException("Only NEW or ACKNOWLEDGED events can be promoted");
        }

        // Prepare request body for payload
        Map<String, Object> requestPayload = new HashMap<>();
        requestPayload.put("title", "[Auto-Promoted] " + event.getMessage());
        requestPayload.put("description", String.format("Promoted from Event: %s\nNode: %s\nSeverity: %s", 
                event.getEventNumber(), event.getNode(), event.getSeverityCode()));
        requestPayload.put("companyId", event.getCompanyId());
        requestPayload.put("requesterId", "system-event");
        requestPayload.put("srTypeCode", "INCIDENT");
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-Company-ID", event.getCompanyId());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestPayload, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "http://request-service:8080/api/v1/request", entity, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                String reqNumber = (String) response.getBody().get("reqNumber");
                event.setRelatedRequestId(reqNumber);
                event.setStatusCode("PROMOTED");
                return EventDTO.fromEntity(eventRepository.save(event));
            } else {
                throw new RuntimeException("Failed to create incident from request service");
            }
        } catch (Exception e) {
            throw new RuntimeException("Error communicating with request service: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    private synchronized String generateEventNumber() {
        YearMonth currentYearMonth = YearMonth.now();
        LocalDateTime startOfMonth = currentYearMonth.atDay(1).atStartOfDay();
        long currentCount = eventRepository.countByCreatedAtAfter(startOfMonth);
        String yyyyMM = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        return String.format("EV-%s-%05d", yyyyMM, currentCount + 1);
    }
}

package com.itsm.event.controller;

import com.itsm.event.dto.EventDTO;
import com.itsm.event.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/event/webhook")
@RequiredArgsConstructor
@Slf4j
public class AlertmanagerController {

    private final EventService eventService;

    /**
     * Handle Alertmanager (Prometheus) Webhooks
     */
    @PostMapping("/alertmanager")
    public ResponseEntity<Void> receiveAlertmanagerAlert(@RequestBody Map<String, Object> payload) {
        log.info("Received Alertmanager webhook: {}", payload);
        processAlerts(payload, "PRM_GRF");
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    /**
     * Handle Grafana Unified Alerting Webhooks
     */
    @PostMapping("/grafana")
    public ResponseEntity<Void> receiveGrafanaAlert(@RequestBody Map<String, Object> payload) {
        log.info("Received Grafana webhook: {}", payload);
        processAlerts(payload, "PRM_GRF");
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    }

    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper();

    @SuppressWarnings("unchecked")
    private void processAlerts(Map<String, Object> payload, String source) {
        Object alertsObj = payload.get("alerts");
        if (alertsObj instanceof List) {
            List<Map<String, Object>> alerts = (List<Map<String, Object>>) alertsObj;
            for (Map<String, Object> alert : alerts) {
                try {
                    String status = (String) alert.get("status");
                    
                    // Robust fingerprint extraction: Check top-level then labels
                    String fingerprint = (String) alert.get("fingerprint");
                    Map<String, String> labels = (Map<String, String>) alert.get("labels");
                    
                    if (fingerprint == null && labels != null) {
                        fingerprint = labels.get("fingerprint");
                    }

                    if ("resolved".equalsIgnoreCase(status)) {
                        eventService.resolveEventByFingerprint(fingerprint);
                        log.info("Successfully resolved event with fingerprint: {}", fingerprint);
                        continue;
                    }

                    Map<String, String> annotations = (Map<String, String>) alert.get("annotations");

                    // 1. Severity Mapping (Standardizing to CRITICAL, MAJOR, MINOR)
                    String rawSeverity = labels.getOrDefault("severity", "WARNING").toUpperCase();
                    String severityCode = mapToSeverityCode(rawSeverity);

                    // 2. Category Mapping (ITIL: INFO, WARN, EXCP)
                    String categoryCode = mapToCategoryCode(rawSeverity);

                    String node = labels.getOrDefault("instance", "system");
                    String alertName = labels.getOrDefault("alertname", "Monitoring Alert");
                    String summary = annotations != null ? annotations.getOrDefault("summary", "") : "";
                    String description = annotations != null ? annotations.getOrDefault("description", "") : "";

                    String fullMessage = String.format("[%s] %s %s", alertName, summary, description).trim();

                    // 3. Extract Company ID from labels (Default to MSP if missing)
                    String companyId = labels != null ? labels.getOrDefault("companyId", "MSP") : "MSP";

                    // 4. Store full payload as details
                    String eventDetails = objectMapper.writeValueAsString(alert);

                    EventDTO dto = EventDTO.builder()
                            .companyId(companyId) 
                            .sourceCode(source)
                            .categoryCode(categoryCode)
                            .node(node)
                            .severityCode(severityCode)
                            .message(fullMessage)
                            .eventDetails(eventDetails)
                            .statusCode("NEW") // Internal code for 'Open'
                            .fingerprint(fingerprint)
                            .build();

                    eventService.createEvent(dto);
                    log.debug("Converted alert to ITIL event: {} (Severity: {}, Category: {})", alertName, severityCode, categoryCode);
                } catch (Exception e) {
                    log.error("Failed to parse alert block: {}", e.getMessage());
                }
            }
        }
    }

    private String mapToSeverityCode(String raw) {
        if (raw.contains("CRITICAL")) return "CRITICAL";
        if (raw.contains("ERROR")) return "CRITICAL";
        if (raw.contains("WARNING")) return "MAJOR";
        return "MINOR";
    }

    private String mapToCategoryCode(String severity) {
        if (severity.contains("CRITICAL")) return "EXCP"; // Exception
        if (severity.contains("WARNING")) return "WARN"; // Warning
        return "INFO"; // Informational
    }
}

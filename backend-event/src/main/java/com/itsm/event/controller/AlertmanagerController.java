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

    @SuppressWarnings("unchecked")
    private void processAlerts(Map<String, Object> payload, String source) {
        Object alertsObj = payload.get("alerts");
        if (alertsObj instanceof List) {
            List<Map<String, Object>> alerts = (List<Map<String, Object>>) alertsObj;
            for (Map<String, Object> alert : alerts) {
                try {
                    Map<String, String> labels = (Map<String, String>) alert.get("labels");
                    Map<String, String> annotations = (Map<String, String>) alert.get("annotations");

                    String severity = labels.getOrDefault("severity", "WARNING").toUpperCase();
                    String node = labels.getOrDefault("instance", "system");
                    String alertName = labels.getOrDefault("alertname", "Monitoring Alert");
                    String summary = annotations != null ? annotations.getOrDefault("summary", "") : "";
                    String description = annotations != null ? annotations.getOrDefault("description", "") : "";

                    String fullMessage = String.format("[%s] %s: %s %s", alertName, summary, description, source).trim();

                    EventDTO dto = EventDTO.builder()
                            .companyId("MSP") // Setting default for now
                            .sourceCode(source)
                            .node(node)
                            .severityCode(severity)
                            .message(fullMessage)
                            .statusCode("NEW")
                            .build();

                    eventService.createEvent(dto);
                    log.debug("Successfully converted alert to ITSM event: {}", alertName);
                } catch (Exception e) {
                    log.error("Failed to parse alert block: {}", e.getMessage());
                }
            }
        }
    }
}

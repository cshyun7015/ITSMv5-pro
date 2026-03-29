package com.itsm.event.controller;

import com.itsm.event.dto.EventDTO;
import com.itsm.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/event/webhook")
@RequiredArgsConstructor
public class AlertmanagerController {

    private final EventService eventService;

    @PostMapping("/alertmanager")
    public ResponseEntity<EventDTO> receiveAlert(@RequestBody Map<String, Object> payload) {
        
        // Very basic stub parser for demonstration of Webhook
        // In a real scenario, we parse Prometheus Alertmanager JSON payload
        EventDTO dto = EventDTO.builder()
                .companyId(payload.getOrDefault("companyId", "MSP").toString())
                .sourceCode("PRM_GRF")
                .node(payload.getOrDefault("instance", "unknown-node").toString())
                .severityCode("WARNING")
                .message("Auto-generated alert from monitoring webhook")
                .statusCode("NEW")
                .build();
                
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto));
    }
}

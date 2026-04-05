package com.itsm.incident.controller;

import com.itsm.incident.dto.IncidentDTO;
import com.itsm.incident.service.IncidentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import com.itsm.incident.domain.types.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;

@RestController
@RequestMapping("/api/v1/incident")
@RequiredArgsConstructor
public class IncidentController {

    private final IncidentService service;

    @PostMapping
    public ResponseEntity<IncidentDTO> create(@RequestBody IncidentDTO dto) {
        return ResponseEntity.ok(service.create(dto));
    }

    @GetMapping
    public ResponseEntity<Page<IncidentDTO>> list(
            @RequestParam String tenantId,
            @RequestParam(required = false) List<IncidentStatus> status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(service.getList(tenantId, status, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<IncidentDTO> get(@PathVariable Long id) {
        return ResponseEntity.ok(service.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<IncidentDTO> update(
            @PathVariable Long id, 
            @RequestBody IncidentDTO dto, 
            @RequestParam String userId) {
        return ResponseEntity.ok(service.update(id, dto, userId));
    }

    @GetMapping("/transitions")
    public ResponseEntity<Map<IncidentStatus, List<IncidentStatus>>> getTransitions() {
        Map<IncidentStatus, List<IncidentStatus>> transitions = new EnumMap<>(IncidentStatus.class);
        for (IncidentStatus status : IncidentStatus.values()) {
            transitions.put(status, status.getNextAllowedStates());
        }
        return ResponseEntity.ok(transitions);
    }
}

package com.itsm.event.controller;

import com.itsm.event.dto.EventDTO;
import com.itsm.event.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/event")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @PostMapping
    public ResponseEntity<EventDTO> createEvent(@RequestBody EventDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(dto));
    }

    @GetMapping
    public Page<EventDTO> getEvents(
            @RequestHeader(value = "X-Company-ID", required = false) String headerCompanyId,
            @RequestParam(value = "companyId", required = false) String queryCompanyId,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        if (queryCompanyId != null) {
            // Case 1: Explicit filter provided (Filter by this specific company only)
            return eventService.getEventsByCompany(queryCompanyId, pageable);
        }
        
        // Case 2: No filter (Show everything in the user's scope)
        String scopeCompanyId = headerCompanyId != null ? headerCompanyId : "MSP";
        return eventService.getEventsInScope(scopeCompanyId, pageable);
    }

    @GetMapping("/{id}")
    public EventDTO getEvent(@PathVariable Long id) {
        return eventService.getEvent(id);
    }

    @PutMapping("/{id}")
    public EventDTO updateEvent(@PathVariable Long id, @RequestBody EventDTO dto) {
        return eventService.updateEvent(id, dto);
    }

    @PostMapping("/{id}/acknowledge")
    public EventDTO acknowledgeEvent(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-ID", required = false) String userId) {
        String effectiveUserId = userId != null ? userId : "anonymous";
        return eventService.acknowledgeEvent(id, effectiveUserId);
    }

    @PostMapping("/{id}/assign")
    public EventDTO assignEvent(
            @PathVariable Long id,
            @RequestParam String assigneeId) {
        return eventService.acknowledgeEvent(id, assigneeId);
    }

    @PostMapping("/{id}/promote")
    public EventDTO promoteEvent(@PathVariable Long id) {
        return eventService.promoteToIncident(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }
}

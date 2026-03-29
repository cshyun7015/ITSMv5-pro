package com.itsm.request.controller;

import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import com.itsm.request.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import java.util.List;

@RestController
@RequestMapping("/api/v1/request")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;

    @PostMapping
    public ResponseEntity<RequestDTO> createRequest(@RequestBody RequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(requestService.createRequest(dto));
    }

    @GetMapping
    public Page<RequestDTO> getRequests(
            @RequestHeader("X-Company-ID") String companyId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String requesterId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return requestService.getRequests(companyId, fromDate, toDate, title, requesterId, pageable);
    }

    @GetMapping("/{id}")
    public RequestDTO getRequest(@PathVariable Long id) {
        return requestService.getRequest(id);
    }

    @PutMapping("/{id}")
    public RequestDTO updateRequest(@PathVariable Long id, @RequestBody RequestDTO dto) {
        return requestService.updateRequest(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
    }

    // --- Comments ---

    @PostMapping("/{id}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public RequestCommentDTO addComment(@PathVariable Long id, @RequestBody RequestCommentDTO dto) {
        return requestService.addComment(id, dto);
    }

    @GetMapping("/{id}/comments")
    public List<RequestCommentDTO> getComments(@PathVariable Long id) {
        return requestService.getComments(id);
    }
}

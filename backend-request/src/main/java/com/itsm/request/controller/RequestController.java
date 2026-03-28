package com.itsm.request.controller;

import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import com.itsm.request.service.RequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public List<RequestDTO> getRequests(@RequestHeader("X-Company-ID") String companyId) {
        return requestService.getRequestsByCompany(companyId);
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

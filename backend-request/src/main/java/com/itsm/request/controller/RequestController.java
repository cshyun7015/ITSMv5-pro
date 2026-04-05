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
            @RequestHeader(value = "X-Company-ID", required = false) String contextCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String userRole,
            @RequestHeader(value = "X-MSP-ID", required = false) String contextMspId,
            @RequestParam(required = false) String companyId, 
            @RequestParam(required = false) String mspId,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String requesterId,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        
        // 1. Tenant Isolation (Customer vs MSP)
        String targetCompanyId = ("MSP".equalsIgnoreCase(contextCompanyId)) ? companyId : contextCompanyId;
        
        // 2. MSP Isolation for Operators (non-admins)
        String targetMspId = mspId;
        if ("ROLE_OPER".equalsIgnoreCase(userRole) && !"ROLE_ADMIN".equalsIgnoreCase(userRole)) {
            // Force his own MSP ID
            targetMspId = contextMspId;
        }
        
        return requestService.getRequests(targetCompanyId, targetMspId, fromDate, toDate, title, requesterId, pageable);
    }

    @GetMapping("/{id}")
    public RequestDTO getRequest(
            @PathVariable Long id,
            @RequestHeader(value = "X-Company-ID", required = false) String companyId,
            @RequestHeader(value = "X-MSP-ID", required = false) String mspId) {
        return requestService.getRequest(id, companyId, mspId);
    }

    @PutMapping("/{id}")
    public RequestDTO updateRequest(
            @PathVariable Long id, 
            @RequestBody RequestDTO dto,
            @RequestHeader(value = "X-Company-ID", required = false) String companyId,
            @RequestHeader(value = "X-MSP-ID", required = false) String mspId) {
        return requestService.updateRequest(id, dto, companyId, mspId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRequest(
            @PathVariable Long id,
            @RequestHeader(value = "X-Company-ID", required = false) String companyId,
            @RequestHeader(value = "X-MSP-ID", required = false) String mspId) {
        requestService.deleteRequest(id, companyId, mspId);
    }

    @GetMapping("/{id}/history")
    public List<com.itsm.request.dto.RequestHistoryDTO> getHistory(
            @PathVariable Long id,
            @RequestHeader(value = "X-Company-ID", required = false) String companyId,
            @RequestHeader(value = "X-MSP-ID", required = false) String mspId) {
        return requestService.getHistory(id, companyId, mspId);
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

    // --- Attachments ---

    @PostMapping("/{id}/attachments")
    public ResponseEntity<com.itsm.request.dto.AttachmentDTO> uploadAttachment(
            @PathVariable Long id,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // 10MB limit enforcement
        if (file.getSize() > 10 * 1024 * 1024) {
             throw new com.itsm.request.exception.BusinessException("File size exceeds 10MB limit", HttpStatus.BAD_REQUEST);
        }

        com.itsm.request.dto.AttachmentDTO dto = requestService.addAttachment(
                id, 
                file.getOriginalFilename(), 
                file.getContentType(), 
                file.getSize(), 
                file.getBytes()
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @GetMapping("/{id}/attachments")
    public List<com.itsm.request.dto.AttachmentDTO> getAttachments(@PathVariable Long id) {
        return requestService.getAttachments(id);
    }

    @GetMapping("/attachments/{attachmentId}/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadAttachment(@PathVariable Long attachmentId) {
        com.itsm.request.domain.Attachment attachment = requestService.getAttachment(attachmentId);
        
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + attachment.getFileName() + "\"")
                .contentType(org.springframework.http.MediaType.parseMediaType(attachment.getFileType()))
                .contentLength(attachment.getFileSize())
                .body(new org.springframework.core.io.ByteArrayResource(attachment.getFileData()));
    }
}

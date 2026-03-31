package com.itsm.request.service;

import com.itsm.request.domain.Request;
import com.itsm.request.domain.RequestComment;
import com.itsm.request.domain.RequestCommentRepository;
import com.itsm.request.domain.RequestRepository;
import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import com.itsm.request.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {

    private final RequestRepository requestRepository;
    private final RequestCommentRepository commentRepository;
    private final com.itsm.request.domain.AttachmentRepository attachmentRepository;

    @Override
    @Transactional
    public RequestDTO createRequest(RequestDTO dto) {
        String reqNumber = generateRequestNumber();
        String priority = calculatePriority(dto.getSrImpactCode(), dto.getSrUrgencyCode());
        
        Request request = Request.builder()
                .reqNumber(reqNumber)
                .companyId(dto.getCompanyId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status("OPEN")
                .priority(priority)
                .srTypeCode(dto.getSrTypeCode())
                .srCategoryCode(dto.getSrCategoryCode())
                .srImpactCode(dto.getSrImpactCode())
                .srUrgencyCode(dto.getSrUrgencyCode())
                .srSourceCode(dto.getSrSourceCode() != null ? dto.getSrSourceCode() : "PORTAL")
                .requesterId(dto.getRequesterId())
                .serviceId(dto.getServiceId())
                .ciId(dto.getCiId())
                .slaTargetAt(dto.getSlaTargetAt() != null ? dto.getSlaTargetAt() : LocalDateTime.now().plusHours(4))
                .expectedAt(dto.getExpectedAt())
                .build();

        return convertToDTO(requestRepository.save(request));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RequestDTO> getRequests(String companyId, String fromDate, String toDate, String title, String requesterId, Pageable pageable) {
        Specification<Request> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            
            // Company Isolation (unless MSP)
            if (!"MSP".equals(companyId)) {
                predicates.add(cb.equal(root.get("companyId"), companyId));
            }
            
            if (fromDate != null && !fromDate.isEmpty()) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), LocalDateTime.parse(fromDate + "T00:00:00")));
            }
            if (toDate != null && !toDate.isEmpty()) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), LocalDateTime.parse(toDate + "T23:59:59")));
            }
            if (title != null && !title.isEmpty()) {
                predicates.add(cb.like(root.get("title"), "%" + title + "%"));
            }
            if (requesterId != null && !requesterId.isEmpty()) {
                predicates.add(cb.equal(root.get("requesterId"), requesterId));
            }
            
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        
        return requestRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDTO> getRequestsByCompany(String companyId) {
        if ("MSP".equals(companyId)) {
            return requestRepository.findAllByOrderByCreatedAtDesc().stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
        }
        return requestRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public RequestDTO getRequest(Long id) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Request not found: " + id, HttpStatus.NOT_FOUND));
        return convertToDTO(request);
    }

    @Override
    @Transactional
    public RequestDTO updateRequest(Long id, RequestDTO dto) {
        Request request = requestRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Request not found: " + id, HttpStatus.NOT_FOUND));
        
        String oldStatus = request.getStatus();
        String newStatus = dto.getStatus();
        
        // 1. Full Lock for CLOSED / CANCELLED
        if ("CLOSED".equals(oldStatus) || "CANCELLED".equals(oldStatus)) {
            throw new BusinessException("Modified restricted for closed or cancelled requests.", HttpStatus.FORBIDDEN);
        }

        // 2. Mandatory Check for RESOLVED transition
        if ("RESOLVED".equals(newStatus)) {
            if (dto.getSrResolutionCode() == null || dto.getSrResolutionCode().trim().isEmpty() ||
                dto.getResolutionText() == null || dto.getResolutionText().trim().isEmpty()) {
                throw new BusinessException("Resolution code and text are required for 'RESOLVED' status.", HttpStatus.BAD_REQUEST);
            }
        }

        // 3. Status Lifecycle & Reopen Logic
        if (newStatus != null && !newStatus.equals(oldStatus)) {
            request.setStatus(newStatus);
            
            if ("RESOLVED".equals(newStatus) && request.getResolvedAt() == null) {
                request.setResolvedAt(LocalDateTime.now());
            } else if ("CLOSED".equals(newStatus) && request.getClosedAt() == null) {
                request.setClosedAt(LocalDateTime.now());
            }
            
            // Reopen Logic: If moving from RESOLVED/CLOSED back to other status
            if (("RESOLVED".equals(oldStatus) || "CLOSED".equals(oldStatus)) && 
                !"RESOLVED".equals(newStatus) && !"CLOSED".equals(newStatus)) {
                request.setReopenCount(request.getReopenCount() + 1);
            }
        }
        
        // 4. Field Control based on RESOLVED status (Typo exception)
        if ("RESOLVED".equals(oldStatus)) {
             // Only allow title, description, and resolution info updates
             request.setTitle(dto.getTitle());
             request.setDescription(dto.getDescription());
             request.setSrResolutionCode(dto.getSrResolutionCode());
             request.setResolutionText(dto.getResolutionText());
             request.setRequesterId(dto.getRequesterId());
             // Other fields are NOT updated here in RESOLVED state
        } else {
             // Normal Update Flow
             request.setTitle(dto.getTitle());
             request.setDescription(dto.getDescription());
             
             // Priority can be re-calculated if impact/urgency changed
             request.setSrImpactCode(dto.getSrImpactCode());
             request.setSrUrgencyCode(dto.getSrUrgencyCode());
             request.setPriority(calculatePriority(dto.getSrImpactCode(), dto.getSrUrgencyCode()));
             
             request.setSrTypeCode(dto.getSrTypeCode());
             request.setSrCategoryCode(dto.getSrCategoryCode());
             request.setSrSourceCode(dto.getSrSourceCode());
             request.setSrResolutionCode(dto.getSrResolutionCode());
             request.setResolutionText(dto.getResolutionText());
             request.setAssigneeId(dto.getAssigneeId());
             request.setServiceId(dto.getServiceId());
             request.setCiId(dto.getCiId());
             request.setExpectedAt(dto.getExpectedAt());
             request.setRequesterId(dto.getRequesterId());
        }
        
        return convertToDTO(requestRepository.save(request));
    }

    @Override
    @Transactional
    public void deleteRequest(Long id) {
        requestRepository.deleteById(id);
    }

    @Override
    @Transactional
    public RequestCommentDTO addComment(Long requestId, RequestCommentDTO dto) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("Request not found: " + requestId, HttpStatus.NOT_FOUND));
        
        RequestComment comment = RequestComment.builder()
                .request(request)
                .authorId(dto.getAuthorId())
                .content(dto.getContent())
                .isInternal(dto.getIsInternal() != null ? dto.getIsInternal() : false)
                .build();
        
        return convertToCommentDTO(commentRepository.save(comment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestCommentDTO> getComments(Long requestId) {
        return commentRepository.findByRequestIdOrderByCreatedAtAsc(requestId).stream()
                .map(this::convertToCommentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public com.itsm.request.dto.AttachmentDTO addAttachment(Long requestId, String fileName, String fileType, long fileSize, byte[] fileData) {
        Request request = requestRepository.findById(requestId)
                .orElseThrow(() -> new BusinessException("Request not found: " + requestId, HttpStatus.NOT_FOUND));
        
        com.itsm.request.domain.Attachment attachment = com.itsm.request.domain.Attachment.builder()
                .request(request)
                .fileName(fileName)
                .fileType(fileType)
                .fileSize(fileSize)
                .fileData(fileData)
                .build();
        
        return convertToAttachmentDTO(attachmentRepository.save(attachment));
    }

    @Override
    @Transactional(readOnly = true)
    public List<com.itsm.request.dto.AttachmentDTO> getAttachments(Long requestId) {
        return attachmentRepository.findByRequestId(requestId).stream()
                .map(this::convertToAttachmentDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public com.itsm.request.domain.Attachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new BusinessException("Attachment not found: " + attachmentId, HttpStatus.NOT_FOUND));
    }

    private String generateRequestNumber() {
        String prefix = "SR-" + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";
        Request lastRequest = requestRepository.findTopByReqNumberStartingWithOrderByReqNumberDesc(prefix);
        
        int nextSeq = 1;
        if (lastRequest != null) {
            String lastNumStr = lastRequest.getReqNumber().substring(prefix.length());
            try {
                nextSeq = Integer.parseInt(lastNumStr) + 1;
            } catch (NumberFormatException e) {
                nextSeq = 1;
            }
        }
        
        return prefix + String.format("%05d", nextSeq);
    }

    private String calculatePriority(String impact, String urgency) {
        if (impact == null || urgency == null) return "P3";
        
        // ITIL 3x3 Matrix
        if ("HIGH".equals(impact)) {
            if ("HIGH".equals(urgency)) return "P1";
            if ("MEDIUM".equals(urgency)) return "P2";
            return "P3";
        } else if ("MEDIUM".equals(impact)) {
            if ("HIGH".equals(urgency)) return "P2";
            if ("MEDIUM".equals(urgency)) return "P3";
            return "P4";
        } else { // LOW Impact
            if ("HIGH".equals(urgency)) return "P3";
            return "P4";
        }
    }

    private RequestDTO convertToDTO(Request req) {
        return RequestDTO.builder()
                .id(req.getId())
                .reqNumber(req.getReqNumber())
                .companyId(req.getCompanyId())
                .title(req.getTitle())
                .description(req.getDescription())
                .status(req.getStatus())
                .priority(req.getPriority())
                .srTypeCode(req.getSrTypeCode())
                .srCategoryCode(req.getSrCategoryCode())
                .srImpactCode(req.getSrImpactCode())
                .srUrgencyCode(req.getSrUrgencyCode())
                .srSourceCode(req.getSrSourceCode())
                .srResolutionCode(req.getSrResolutionCode())
                .resolutionText(req.getResolutionText())
                .requesterId(req.getRequesterId())
                .assigneeId(req.getAssigneeId())
                .serviceId(req.getServiceId())
                .ciId(req.getCiId())
                .slaTargetAt(req.getSlaTargetAt())
                .resolvedAt(req.getResolvedAt())
                .closedAt(req.getClosedAt())
                .reopenCount(req.getReopenCount())
                .expectedAt(req.getExpectedAt())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .attachments(req.getAttachments() != null ? req.getAttachments().stream()
                        .map(this::convertToAttachmentDTO)
                        .collect(Collectors.toList()) : new ArrayList<>())
                .build();
    }

    private com.itsm.request.dto.AttachmentDTO convertToAttachmentDTO(com.itsm.request.domain.Attachment attachment) {
        return com.itsm.request.dto.AttachmentDTO.builder()
                .id(attachment.getId())
                .requestId(attachment.getRequest().getId())
                .fileName(attachment.getFileName())
                .fileType(attachment.getFileType())
                .fileSize(attachment.getFileSize())
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    private RequestCommentDTO convertToCommentDTO(RequestComment comment) {
        return RequestCommentDTO.builder()
                .id(comment.getId())
                .requestId(comment.getRequest().getId())
                .authorId(comment.getAuthorId())
                .content(comment.getContent())
                .isInternal(comment.getIsInternal())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}

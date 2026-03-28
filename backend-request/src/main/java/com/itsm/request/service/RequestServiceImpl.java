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

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RequestServiceImpl implements RequestService {

    private final RequestRepository requestRepository;
    private final RequestCommentRepository commentRepository;

    @Override
    @Transactional
    public RequestDTO createRequest(RequestDTO dto) {
        String reqNumber = generateRequestNumber();
        
        Request request = Request.builder()
                .reqNumber(reqNumber)
                .companyId(dto.getCompanyId())
                .title(dto.getTitle())
                .description(dto.getDescription())
                .status("OPEN")
                .priority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM")
                .requesterId(dto.getRequesterId())
                .slaTargetAt(dto.getSlaTargetAt() != null ? dto.getSlaTargetAt() : LocalDateTime.now().plusHours(4))
                .build();

        return convertToDTO(requestRepository.save(request));
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequestDTO> getRequestsByCompany(String companyId) {
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
        
        request.setTitle(dto.getTitle());
        request.setDescription(dto.getDescription());
        request.setStatus(dto.getStatus());
        request.setPriority(dto.getPriority());
        request.setAssigneeId(dto.getAssigneeId());
        
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

    private String generateRequestNumber() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = new Random().nextInt(9000) + 1000;
        return "REQ-" + datePart + "-" + randomPart;
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
                .requesterId(req.getRequesterId())
                .assigneeId(req.getAssigneeId())
                .serviceId(req.getServiceId())
                .slaTargetAt(req.getSlaTargetAt())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
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

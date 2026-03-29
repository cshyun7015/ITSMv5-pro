package com.itsm.request.service;

import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RequestService {
    RequestDTO createRequest(RequestDTO dto);
    Page<RequestDTO> getRequests(String companyId, String fromDate, String toDate, String title, String requesterId, Pageable pageable);
    List<RequestDTO> getRequestsByCompany(String companyId);
    RequestDTO getRequest(Long id);
    RequestDTO updateRequest(Long id, RequestDTO dto);
    void deleteRequest(Long id);
    
    // Comments
    RequestCommentDTO addComment(Long requestId, RequestCommentDTO dto);
    List<RequestCommentDTO> getComments(Long requestId);
}

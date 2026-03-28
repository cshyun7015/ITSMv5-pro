package com.itsm.request.service;

import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;

import java.util.List;

public interface RequestService {
    RequestDTO createRequest(RequestDTO dto);
    List<RequestDTO> getRequestsByCompany(String companyId);
    RequestDTO getRequest(Long id);
    RequestDTO updateRequest(Long id, RequestDTO dto);
    void deleteRequest(Long id);
    
    // Comments
    RequestCommentDTO addComment(Long requestId, RequestCommentDTO dto);
    List<RequestCommentDTO> getComments(Long requestId);
}

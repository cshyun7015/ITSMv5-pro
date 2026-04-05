package com.itsm.request.service;

import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RequestService {
    RequestDTO createRequest(RequestDTO dto);
    Page<RequestDTO> getRequests(String companyId, String mspId, String fromDate, String toDate, String title, String requesterId, Pageable pageable);
    List<RequestDTO> getRequestsByCompany(String companyId);
    RequestDTO getRequest(Long id);
    RequestDTO updateRequest(Long id, RequestDTO dto);
    void deleteRequest(Long id);

    // Audit
    List<com.itsm.request.dto.RequestHistoryDTO> getHistory(Long requestId);
    
    // Comments
    RequestCommentDTO addComment(Long requestId, RequestCommentDTO dto);
    List<RequestCommentDTO> getComments(Long requestId);

    // Attachments
    com.itsm.request.dto.AttachmentDTO addAttachment(Long requestId, String fileName, String fileType, long fileSize, byte[] fileData);
    List<com.itsm.request.dto.AttachmentDTO> getAttachments(Long requestId);
    com.itsm.request.domain.Attachment getAttachment(Long attachmentId);
}

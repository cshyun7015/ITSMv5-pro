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
    RequestDTO getRequest(Long id, String companyId, String mspId);
    RequestDTO updateRequest(Long id, RequestDTO dto, String companyId, String mspId);
    void deleteRequest(Long id, String companyId, String mspId);

    // Audit
    List<com.itsm.request.dto.RequestHistoryDTO> getHistory(Long requestId, String companyId, String mspId);
    
    // Comments
    RequestCommentDTO addComment(Long requestId, RequestCommentDTO dto);
    List<RequestCommentDTO> getComments(Long requestId);

    // Attachments
    com.itsm.request.dto.AttachmentDTO addAttachment(Long requestId, String fileName, String fileType, long fileSize, byte[] fileData);
    List<com.itsm.request.dto.AttachmentDTO> getAttachments(Long requestId);
    com.itsm.request.domain.Attachment getAttachment(Long attachmentId);
}

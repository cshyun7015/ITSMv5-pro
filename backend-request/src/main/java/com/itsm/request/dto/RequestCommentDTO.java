package com.itsm.request.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RequestCommentDTO {
    private Long id;
    private Long requestId;
    private String authorId;
    private String content;
    private Boolean isInternal;
    private LocalDateTime createdAt;
}

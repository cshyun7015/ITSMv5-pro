package com.itsm.system.dto.operator;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorDTO {
    private Long id;
    private String userId;
    private String password;
    private String name;
    private String email;
    private String role;
    private Boolean isActive;
    private String tenantId;
    private LocalDateTime createdAt;
    private List<OperatorTeamDTO> teams; // 다중 소속 지원
}

package com.itsm.system.dto.organization.operator;

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
    private String name;
    private String email;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<OperatorTeamDTO> teams; // 다중 소속 지원
}

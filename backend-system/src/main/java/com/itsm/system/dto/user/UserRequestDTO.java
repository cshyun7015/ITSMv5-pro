package com.itsm.system.dto.user;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {
    private String userId;
    private String password;
    private String name;
    private String email;
    private String role;
    private String companyId;
    private Boolean isActive;
}

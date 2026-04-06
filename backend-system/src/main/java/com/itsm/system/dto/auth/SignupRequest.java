package com.itsm.system.dto.auth;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SignupRequest {
    private String userId;
    private String password;
    private String name;
    private String email;
    private String companyId;
}

package com.itsm.system.dto.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class AuthResponse {
    private String userId;
    private String name;
    private String role;
    private String companyId;
    private String companyName;
}

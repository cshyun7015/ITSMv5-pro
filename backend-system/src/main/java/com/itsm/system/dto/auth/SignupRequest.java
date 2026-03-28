package com.itsm.system.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SignupRequest {
    private String userId;
    private String password;
    private String name;
    private String email;
    private String companyId;
}

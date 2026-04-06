package com.itsm.system.integration.auth;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.customer.CustomerTeam;
import com.itsm.system.dto.auth.AuthResponse;
import com.itsm.system.dto.auth.LoginRequest;
import com.itsm.system.dto.auth.SignupRequest;
import com.itsm.system.repository.organization.customer.CustomerCompanyRepository;
import com.itsm.system.repository.organization.customer.CustomerTeamRepository;
import com.itsm.system.repository.organization.customer.CustomerUserRepository;
import com.itsm.system.service.auth.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AuthIntegrationTest {

    @Autowired
    private AuthService authService;

    @Autowired
    private CustomerCompanyRepository companyRepository;

    @Autowired
    private CustomerTeamRepository teamRepository;

    @Autowired
    private CustomerUserRepository userRepository;

    @BeforeEach
    void setUp() {
        // Create a test company and a default team required for signup
        CustomerCompany company = companyRepository.save(CustomerCompany.builder()
                .customerId("AUTH-COMP")
                .name("인증테스트사")
                .build());

        teamRepository.save(CustomerTeam.builder()
                .customerCompany(company)
                .name("기본팀")
                .build());
    }

    @Test
    @DisplayName("회원가입 후 로그인 성공 시나리오")
    void signupAndLogin_Success() {
        // 1. Signup
        SignupRequest signup = SignupRequest.builder()
                .userId("authuser")
                .password("pass123")
                .name("인증인")
                .companyId("AUTH-COMP")
                .build();
        
        AuthResponse signupRes = authService.signup(signup);
        assertThat(signupRes.getUserId()).isEqualTo("authuser");

        // 2. Login
        LoginRequest login = LoginRequest.builder()
                .userId("authuser")
                .password("pass123")
                .build();
        
        AuthResponse loginRes = authService.login(login);
        assertThat(loginRes.getUserId()).isEqualTo("authuser");
        assertThat(loginRes.getCompanyName()).isEqualTo("인증테스트사");
    }

    @Test
    @DisplayName("잘못된 비밀번호로 로그인 시 예외 발생")
    void login_InvalidPassword_ThrowsException() {
        // Signup first
        SignupRequest signup = SignupRequest.builder()
                .userId("authuser2")
                .password("correct-pass")
                .name("인증인2")
                .companyId("AUTH-COMP")
                .build();
        authService.signup(signup);

        // Login with wrong password
        LoginRequest login = LoginRequest.builder()
                .userId("authuser2")
                .password("wrong-pass")
                .build();

        assertThatThrownBy(() -> authService.login(login))
                .isInstanceOf(BadCredentialsException.class);
    }
}

package com.itsm.system.integration.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.domain.operator.Operator;
import com.itsm.system.domain.operator.OperatorCompany;
import com.itsm.system.domain.operator.OperatorTeam;
import com.itsm.system.domain.operator.mapping.OperatorTeamMember;
import com.itsm.system.dto.auth.LoginRequest;
import com.itsm.system.repository.operator.OperatorRepository;
import com.itsm.system.repository.operator.OperatorCompanyRepository;
import com.itsm.system.repository.operator.OperatorTeamRepository;
import com.itsm.system.repository.operator.mapping.OperatorTeamMemberRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import jakarta.servlet.http.Cookie;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private OperatorRepository operatorRepository;

    @Autowired
    private OperatorCompanyRepository companyRepository;

    @Autowired
    private OperatorTeamRepository teamRepository;

    @Autowired
    private OperatorTeamMemberRepository memberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        // 1. Create a Super Company (MSP)
        OperatorCompany msp = companyRepository.save(OperatorCompany.builder()
                .operatorCompanyId("MSP-COMP")
                .name("MSP Global")
                .isSuperCompany(true)
                .status("ACTIVE")
                .build());

        OperatorTeam team = teamRepository.save(OperatorTeam.builder()
                .operatorCompany(msp)
                .name("Admin Team")
                .build());

        // 2. Active Super Admin
        Operator operator = operatorRepository.save(Operator.builder()
                .userId("superadmin")
                .password(passwordEncoder.encode("pass123"))
                .name("Super Admin")
                .role("ROLE_ADMIN")
                .isActive(true)
                .build());

        memberRepository.save(OperatorTeamMember.builder()
                .operator(operator)
                .operatorTeam(team)
                .build());

        // 3. Inactive Operator
        operatorRepository.save(Operator.builder()
                .userId("inactive_oper")
                .password(passwordEncoder.encode("pass123"))
                .name("Inactive Oper")
                .role("ROLE_OPER")
                .isActive(false)
                .build());

        // 4. Deleted Operator
        Operator deletedOper = Operator.builder()
                .userId("deleted_oper")
                .password(passwordEncoder.encode("pass123"))
                .name("Deleted Oper")
                .role("ROLE_OPER")
                .isActive(true)
                .build();
        deletedOper.setIsDeleted(true);
        operatorRepository.save(deletedOper);
    }

    @Test
    @DisplayName("TC-AUTH-03: Super Company 로그인 성공 및 /me 정보 확인")
    void loginAndMe_SuperCompany_Success() throws Exception {
        LoginRequest loginRequest = new LoginRequest("superadmin", "pass123");

        var result = mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(cookie().httpOnly("ITSMSession", true))
                .andExpect(jsonPath("$.userId").value("superadmin"))
                .andExpect(jsonPath("$.isSuperCompany").value(true))
                .andReturn();

        Cookie sessionCookie = result.getResponse().getCookie("ITSMSession");

        mockMvc.perform(get("/v1/auth/me")
                .cookie(sessionCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.isSuperCompany").value(true));
    }

    @Test
    @DisplayName("TC-FAIL-01: 존재하지 않는 ID로 로그인 시 401 반환")
    void login_NonExistentUser_Unauthorized() throws Exception {
        LoginRequest loginRequest = new LoginRequest("no_user", "pass123");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-FAIL-03: 비활성화 계정 로그인 시도시 거부")
    void login_InactiveUser_Unauthorized() throws Exception {
        LoginRequest loginRequest = new LoginRequest("inactive_oper", "pass123");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-FAIL-04: 삭제된 계정 로그인 시도시 거부")
    void login_DeletedUser_Unauthorized() throws Exception {
        LoginRequest loginRequest = new LoginRequest("deleted_oper", "pass123");

        mockMvc.perform(post("/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-SESS-03: 변조된 토큰으로 호출 시 401 반환")
    void me_TamperedToken_Unauthorized() throws Exception {
        Cookie tamperedCookie = new Cookie("ITSMSession", "invalid.jwt.token");

        mockMvc.perform(get("/v1/auth/me")
                .cookie(tamperedCookie))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("TC-EXIT-01: 로그아웃 성공 시 쿠키 삭제")
    void logout_Success() throws Exception {
        mockMvc.perform(post("/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(cookie().maxAge("ITSMSession", 0));
    }
}

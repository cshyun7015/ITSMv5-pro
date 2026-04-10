package com.itsm.system.controller.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.auth.AuthResponse;
import com.itsm.system.dto.auth.LoginRequest;
import com.itsm.system.dto.auth.SignupRequest;
import com.itsm.system.security.JwtAuthenticationFilter;
import com.itsm.system.security.JwtTokenProvider;
import com.itsm.system.security.TenantContextFilter;
import com.itsm.system.service.auth.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseCookie;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private TenantContextFilter tenantContextFilter;

    @Test
    @DisplayName("로그인 성공 시 세션 쿠키와 응답 데이터 반환")
    void login_Success_ReturnsCookieAndResponse() throws Exception {
        // given
        LoginRequest request = LoginRequest.builder().userId("user1").password("pass123").build();
        AuthResponse response = AuthResponse.builder().userId("user1").name("홍길동").role("ROLE_USER").build();
        ResponseCookie cookie = ResponseCookie.from("ITSMSession", "mock-token").httpOnly(true).path("/").build();

        given(authService.login(any(LoginRequest.class))).willReturn(response);
        given(authService.createToken(any(AuthResponse.class))).willReturn("mock-token");
        given(tokenProvider.createHttpOnlyCookie("mock-token")).willReturn(cookie);

        // when & then
        mockMvc.perform(post("/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(header().exists("Set-Cookie"))
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("ITSMSession=mock-token")))
                .andExpect(jsonPath("$.userId").value("user1"));
    }

    @Test
    @DisplayName("회원가입 성공 시 사용자 정보 반환")
    void signup_Success_ReturnsResponse() throws Exception {
        // given
        SignupRequest request = SignupRequest.builder()
                .userId("newuser")
                .password("pass123")
                .name("이순신")
                .companyId("COMP-01")
                .build();
        AuthResponse response = AuthResponse.builder().userId("newuser").name("이순신").role("ROLE_USER").build();
        ResponseCookie cookie = ResponseCookie.from("ITSMSession", "signup-token").httpOnly(true).path("/").build();

        given(authService.signup(any(SignupRequest.class))).willReturn(response);
        given(authService.createToken(any(AuthResponse.class))).willReturn("signup-token");
        given(tokenProvider.createHttpOnlyCookie("signup-token")).willReturn(cookie);

        // when & then
        mockMvc.perform(post("/v1/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("newuser"));
    }

    @Test
    @DisplayName("로그아웃 시 세션 쿠키 만료 처리")
    void logout_Success_ClearsCookie() throws Exception {
        mockMvc.perform(post("/v1/auth/logout"))
                .andExpect(status().isOk())
                .andExpect(header().string("Set-Cookie", org.hamcrest.Matchers.containsString("Max-Age=0")));
    }
}

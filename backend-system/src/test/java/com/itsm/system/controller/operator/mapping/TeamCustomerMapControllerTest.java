package com.itsm.system.controller.operator.mapping;

import com.itsm.system.service.operator.mapping.TeamCustomerMapService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import com.itsm.system.security.JwtAuthenticationFilter;
import com.itsm.system.security.JwtTokenProvider;
import com.itsm.system.security.TenantContextFilter;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = TeamCustomerMapController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc
@org.springframework.context.annotation.Import(TeamCustomerMapControllerTest.TestSecurityConfig.class)
class TeamCustomerMapControllerTest {

    @org.springframework.boot.test.context.TestConfiguration
    @org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
    static class TestSecurityConfig {
    }

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeamCustomerMapService mappingService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private TenantContextFilter tenantContextFilter;

    @org.junit.jupiter.api.BeforeEach
    void setUp() throws jakarta.servlet.ServletException, java.io.IOException {
        doAnswer(invocation -> {
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(jwtAuthenticationFilter).doFilter(any(), any(), any());

        doAnswer(invocation -> {
            jakarta.servlet.FilterChain chain = invocation.getArgument(2);
            chain.doFilter(invocation.getArgument(0), invocation.getArgument(1));
            return null;
        }).when(tenantContextFilter).doFilter(any(), any(), any());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("ADMIN 권한이 있는 사용자는 매핑 조회가 가능하다")
    void getAllMappings_Admin_Success() throws Exception {
        mockMvc.perform(get("/v1/operator/mapping"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(roles = "USER")
    @DisplayName("ADMIN 권한이 없는(USER) 사용자는 매핑 조회가 금지된다")
    void getAllMappings_User_Forbidden() throws Exception {
        mockMvc.perform(get("/v1/operator/mapping"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("인증되지 않은 사용자는 매핑 조회가 금지된다")
    void getAllMappings_Anonymous_Unauthorized() throws Exception {
        mockMvc.perform(get("/v1/operator/mapping"))
                .andExpect(status().isUnauthorized());
    }
}

package com.itsm.system.controller.operator;

import com.itsm.system.dto.operator.OperatorCompanyDTO;
import com.itsm.system.service.operator.OperatorService;
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
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = OperatorController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class OperatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private OperatorService operatorService;

    @MockBean
    private JwtTokenProvider tokenProvider;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private TenantContextFilter tenantContextFilter;

    @Test
    @WithMockUser(roles = "OPER")
    @DisplayName("운영사 전체 조회 API는 ApiResponse 규격을 준수한다")
    void getAllCompanies_ReturnsApiResponse() throws Exception {
        // given
        List<OperatorCompanyDTO> companies = List.of(
                OperatorCompanyDTO.builder().id(1L).name("Comp A").build()
        );
        when(operatorService.getAllCompanies()).thenReturn(companies);

        // when & then
        mockMvc.perform(get("/v1/operator/companies")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Comp A"));
    }

    @Test
    @WithMockUser(roles = "OPER")
    @DisplayName("존재하지 않는 운영사 조회 시 ApiResponse 타입의 에러 응답이 온다")
    void getCompany_NotFound_HandledByGlobalException() throws Exception {
        // This test would typically verify the global exception handler as well
        // but since it's a slice test, we just check if it returns what the service throws
        when(operatorService.getCompany(99L)).thenThrow(new RuntimeException("Operator company not found"));

        mockMvc.perform(get("/v1/operator/companies/99"))
                .andExpect(status().isInternalServerError()) // Depending on GlobalExceptionHandler
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Operator company not found"));
    }
}

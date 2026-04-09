package com.itsm.system.controller.organization;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.controller.operator.OperatorController;
import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.security.JwtAuthenticationFilter;
import com.itsm.system.security.JwtTokenProvider;
import com.itsm.system.service.organization.operator.OperatorService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = OperatorController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class OperatorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private OperatorService operatorService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    // --- Operator Company Tests ---

    @Test
    @DisplayName("영속사 전체 조회 - 성공")
    void getAllCompanies_Success() throws Exception {
        given(operatorService.getAllCompanies()).willReturn(List.of(OperatorCompanyDTO.builder().id(1L).name("운영사A").build()));

        mockMvc.perform(get("/api/v1/organization/operators/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("운영사A"));
    }

    @Test
    @DisplayName("운영사 생성 - 성공")
    void createCompany_ValidDto_ReturnsOk() throws Exception {
        OperatorCompanyDTO dto = OperatorCompanyDTO.builder().operatorCompanyId("OP001").name("신규운영사").build();
        given(operatorService.createCompany(any(OperatorCompanyDTO.class))).willReturn(dto);

        mockMvc.perform(post("/api/v1/organization/operators/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operatorCompanyId").value("OP001"));
    }

    // --- Operator Team Tests ---

    @Test
    @DisplayName("모든 운영팀 조회 - 성공")
    void getAllTeams_Success() throws Exception {
        given(operatorService.getAllTeams()).willReturn(List.of(OperatorTeamDTO.builder().id(10L).name("운영팀1").build()));

        mockMvc.perform(get("/api/v1/organization/operators/teams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("운영팀1"));
    }

    @Test
    @DisplayName("운영사별 팀 생성 - 성공")
    void createTeam_ValidDto_ReturnsOk() throws Exception {
        OperatorTeamDTO dto = OperatorTeamDTO.builder().name("관제팀").build();
        given(operatorService.createTeam(anyLong(), any(OperatorTeamDTO.class))).willReturn(dto);

        mockMvc.perform(post("/api/v1/organization/operators/companies/1/teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("관제팀"));
    }

    // --- Operator Tests ---

    @Test
    @DisplayName("운영자 생성 - 성공")
    void createOperator_ValidDto_ReturnsOk() throws Exception {
        OperatorDTO dto = OperatorDTO.builder().userId("oper1").name("운영자A").password("pass123").build();
        given(operatorService.createOperator(anyLong(), any(OperatorDTO.class))).willReturn(dto);

        mockMvc.perform(post("/api/v1/organization/operators/teams/10/operators")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value("oper1"));
    }

    @Test
    @DisplayName("운영자 팀 배정 - 성공")
    void assignTeam_Success() throws Exception {
        doNothing().when(operatorService).assignTeam(100L, 10L);

        mockMvc.perform(post("/api/v1/organization/operators/operators/100/teams/10"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("운영자 삭제 - 성공")
    void deleteOperator_Success() throws Exception {
        doNothing().when(operatorService).deleteOperator(100L);

        mockMvc.perform(delete("/api/v1/organization/operators/operators/100"))
                .andExpect(status().isOk());
    }
}

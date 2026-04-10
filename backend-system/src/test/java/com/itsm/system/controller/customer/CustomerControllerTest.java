package com.itsm.system.controller.customer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.organization.customer.CustomerCompanyDTO;
import com.itsm.system.dto.organization.customer.CustomerTeamDTO;
import com.itsm.system.dto.organization.customer.CustomerUserDTO;
import com.itsm.system.security.JwtAuthenticationFilter;
import com.itsm.system.security.JwtTokenProvider;
import com.itsm.system.security.TenantContextFilter;
import com.itsm.system.service.customer.CustomerService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CustomerController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CustomerService customerService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @MockBean
    private TenantContextFilter tenantContextFilter;

    // --- Company Tests ---

    @Test
    @WithMockUser
    @DisplayName("전체 고객사 조회 - 성공 (ApiResponse 적용)")
    void getAllCompanies_Success() throws Exception {
        given(customerService.getAllCompanies()).willReturn(List.of(CustomerCompanyDTO.builder().id(1L).name("고객사A").build()));

        mockMvc.perform(get("/v1/customer/companies"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("고객사A"));
    }

    @Test
    @WithMockUser
    @DisplayName("고객사 생성 - 성공 (ApiResponse 적용)")
    void createCompany_ValidDto_ReturnsOk() throws Exception {
        CustomerCompanyDTO dto = CustomerCompanyDTO.builder().customerId("C001").name("신규고객").build();
        given(customerService.createCompany(any(CustomerCompanyDTO.class))).willReturn(dto);

        mockMvc.perform(post("/v1/customer/companies")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.customerId").value("C001"));
    }

    // --- Team Tests ---

    @Test
    @WithMockUser
    @DisplayName("조직도 트리 조회 - 성공")
    void getOrganizationTree_Success() throws Exception {
        given(customerService.getOrganizationTree(1L)).willReturn(List.of(CustomerTeamDTO.builder().id(10L).name("Root팀").build()));

        mockMvc.perform(get("/v1/customer/companies/1/customer-tree"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Root팀"));
    }

    @Test
    @WithMockUser
    @DisplayName("팀 생성 - 성공 (ApiResponse 적용)")
    void createTeam_ValidDto_ReturnsOk() throws Exception {
        CustomerTeamDTO dto = CustomerTeamDTO.builder().name("IT팀").build();
        given(customerService.createTeam(anyLong(), any(CustomerTeamDTO.class))).willReturn(dto);

        mockMvc.perform(post("/v1/customer/companies/1/teams")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("IT팀"));
    }

    // --- User Tests ---

    @Test
    @WithMockUser
    @DisplayName("팀별 사용자 조회 - 성공 (ApiResponse 적용)")
    void getUsersByTeam_Success() throws Exception {
        given(customerService.getUsersByTeam(10L)).willReturn(List.of(CustomerUserDTO.builder().userId("user1").build()));

        mockMvc.perform(get("/v1/customer/teams/10/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].userId").value("user1"));
    }

    @Test
    @WithMockUser
    @DisplayName("사용자 생성 - 성공 (ApiResponse 적용)")
    void createUser_ValidDto_ReturnsOk() throws Exception {
        CustomerUserDTO dto = CustomerUserDTO.builder().userId("newuser").password("pass123").build();
        given(customerService.createUser(anyLong(), any(CustomerUserDTO.class))).willReturn(dto);

        mockMvc.perform(post("/v1/customer/teams/10/users")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.userId").value("newuser"));
    }

    @Test
    @WithMockUser
    @DisplayName("사용자 삭제 - 성공")
    void deleteUser_ValidId_ReturnsOk() throws Exception {
        doNothing().when(customerService).deleteUser(100L);

        mockMvc.perform(delete("/v1/customer/users/100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}

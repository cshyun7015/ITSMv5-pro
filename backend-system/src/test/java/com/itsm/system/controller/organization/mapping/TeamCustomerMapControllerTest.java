package com.itsm.system.controller.organization.mapping;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.organization.mapping.TeamCustomerMapDTO;
import com.itsm.system.security.JwtAuthenticationFilter;
import com.itsm.system.security.JwtTokenProvider;
import com.itsm.system.service.organization.mapping.TeamCustomerMapService;
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

import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = TeamCustomerMapController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class TeamCustomerMapControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeamCustomerMapService mappingService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("팀별 매핑 정보 조회 - 성공")
    void getMappingsByTeam_ValidId_ReturnsList() throws Exception {
        // given
        TeamCustomerMapDTO dto = TeamCustomerMapDTO.builder()
                .operatorTeamId(1L)
                .operatorTeamName("운영1팀")
                .customerCompanyId(10L)
                .customerCompanyName("고객사A")
                .build();
        given(mappingService.getMappingsByTeam(1L)).willReturn(List.of(dto));

        // when & then
        mockMvc.perform(get("/api/v1/organization/mappings/team/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].operatorTeamId").value(1))
                .andExpect(jsonPath("$[0].customerCompanyName").value("고객사A"));
    }

    @Test
    @DisplayName("고객사별 매핑 정보 조회 - 성공")
    void getMappingsByCustomer_ValidId_ReturnsList() throws Exception {
        // given
        TeamCustomerMapDTO dto = TeamCustomerMapDTO.builder()
                .operatorTeamId(1L)
                .operatorTeamName("운영1팀")
                .customerCompanyId(10L)
                .customerCompanyName("고객사A")
                .build();
        given(mappingService.getMappingsByCustomer(10L)).willReturn(List.of(dto));

        // when & then
        mockMvc.perform(get("/api/v1/organization/mappings/customer/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].customerCompanyId").value(10))
                .andExpect(jsonPath("$[0].operatorTeamName").value("운영1팀"));
    }

    @Test
    @DisplayName("팀을 고객사에 할당 - 성공")
    void assignTeamToCustomer_ValidIds_ReturnsCreated() throws Exception {
        // given
        TeamCustomerMapDTO dto = TeamCustomerMapDTO.builder()
                .operatorTeamId(1L)
                .customerCompanyId(10L)
                .build();
        given(mappingService.assignTeamToCustomer(1L, 10L)).willReturn(dto);

        // when & then
        mockMvc.perform(post("/api/v1/organization/mappings/1/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.operatorTeamId").value(1))
                .andExpect(jsonPath("$.customerCompanyId").value(10));
    }

    @Test
    @DisplayName("팀 고객사 할당 해제 - 성공")
    void unassignTeamFromCustomer_ValidIds_ReturnsNoContent() throws Exception {
        // given
        doNothing().when(mappingService).unassignTeamFromCustomer(1L, 10L);

        // when & then
        mockMvc.perform(delete("/api/v1/organization/mappings/1/10"))
                .andExpect(status().isNoContent());
    }
}

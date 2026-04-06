package com.itsm.incident.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.incident.domain.types.IncidentStatus;
import com.itsm.incident.dto.IncidentDTO;
import com.itsm.incident.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidentController.class)
class IncidentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IncidentService incidentService;

    @Autowired
    private ObjectMapper objectMapper;

    private IncidentDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleDTO = IncidentDTO.builder()
                .id(1L)
                .incidentId("INC-20260405-TEST")
                .title("Network Outage")
                .description("Service is down.")
                .status(IncidentStatus.NEW)
                .tenantId("SYSTEM")
                .build();
    }

    @Test
    @DisplayName("인시던트 등록 API 테스트")
    void createIncident_ApiTest() throws Exception {
        when(incidentService.create(any(IncidentDTO.class))).thenReturn(sampleDTO);

        mockMvc.perform(post("/api/v1/incident")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(sampleDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.incidentId").value("INC-20260405-TEST"))
                .andExpect(jsonPath("$.status").value("NEW"));
    }

    @Test
    @DisplayName("인시던트 상세 조회 API 테스트")
    void getIncidentById_ApiTest() throws Exception {
        when(incidentService.getById(1L)).thenReturn(sampleDTO);

        mockMvc.perform(get("/api/v1/incident/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Network Outage"));
    }

    @Test
    @DisplayName("인시던트 수정 API 테스트")
    void updateIncident_ApiTest() throws Exception {
        IncidentDTO updatedDTO = sampleDTO;
        updatedDTO.setStatus(IncidentStatus.IN_PROGRESS);
        
        when(incidentService.update(any(Long.class), any(IncidentDTO.class), any(String.class))).thenReturn(updatedDTO);

        mockMvc.perform(put("/api/v1/incident/1")
                        .param("userId", "SYSTEM")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updatedDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    @Test
    @DisplayName("인시던트 목록 조회 API 테스트")
    void getIncidentList_ApiTest() throws Exception {
        org.springframework.data.domain.Page<IncidentDTO> page = new org.springframework.data.domain.PageImpl<>(java.util.Collections.singletonList(sampleDTO));
        when(incidentService.getList(any(), any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/incident?tenantId=SYSTEM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].incidentId").value("INC-20260405-TEST"));
    }
}

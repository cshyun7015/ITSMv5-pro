package com.itsm.system.controller.code;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import com.itsm.system.service.code.CommonCodeService;
import com.itsm.system.security.JwtAuthenticationFilter;
import com.itsm.system.security.JwtTokenProvider;
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
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = CommonCodeController.class, excludeAutoConfiguration = SecurityAutoConfiguration.class)
@AutoConfigureMockMvc(addFilters = false)
class CommonCodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private CommonCodeService commonCodeService;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private JwtTokenProvider jwtTokenProvider;

    @Test
    @DisplayName("공통 코드 그룹 리스트 조회 - 성공")
    void getAllGroups_ReturnsList_Success() throws Exception {
        // given
        CodeGroupDTO groupDto = CodeGroupDTO.builder()
                .groupId("PRIORITY")
                .name("우선순위")
                .isSystem(true)
                .build();
        given(commonCodeService.getAllGroups()).willReturn(List.of(groupDto));

        // when & then
        mockMvc.perform(get("/api/v1/system/codes/groups"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].groupId").value("PRIORITY"))
                .andExpect(jsonPath("$[0].name").value("우선순위"));
    }

    @Test
    @DisplayName("공통 코드 그룹 생성 - 성공")
    void createGroup_ValidDto_ReturnsCreated() throws Exception {
        // given
        CodeGroupDTO inputDto = CodeGroupDTO.builder()
                .groupId("STATUS")
                .name("상태코드")
                .build();
        given(commonCodeService.createGroup(any(CodeGroupDTO.class))).willReturn(inputDto);

        // when & then
        mockMvc.perform(post("/api/v1/system/codes/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.groupId").value("STATUS"));
    }

    @Test
    @DisplayName("특정 코드 그룹 상세 조회 - 성공")
    void getGroup_ValidId_ReturnsDto() throws Exception {
        // given
        CodeGroupDTO groupDto = CodeGroupDTO.builder()
                .groupId("PRIORITY")
                .name("우선순위")
                .build();
        given(commonCodeService.getGroup("PRIORITY")).willReturn(groupDto);

        // when & then
        mockMvc.perform(get("/api/v1/system/codes/groups/PRIORITY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.groupId").value("PRIORITY"))
                .andExpect(jsonPath("$.name").value("우선순위"));
    }

    @Test
    @DisplayName("특정 코드 그룹 수정 - 성공")
    void updateGroup_ValidDto_ReturnsUpdatedDto() throws Exception {
        // given
        CodeGroupDTO updateDto = CodeGroupDTO.builder()
                .name("수정된 우선순위")
                .description("설명 수정")
                .build();
        CodeGroupDTO resultDto = CodeGroupDTO.builder()
                .groupId("PRIORITY")
                .name("수정된 우선순위")
                .build();
        given(commonCodeService.updateGroup(any(String.class), any(CodeGroupDTO.class))).willReturn(resultDto);

        // when & then
        mockMvc.perform(put("/api/v1/system/codes/groups/PRIORITY")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("수정된 우선순위"));
    }

    @Test
    @DisplayName("특정 코드 그룹 삭제 - 성공")
    void deleteGroup_ValidId_ReturnsNoContent() throws Exception {
        // given
        doNothing().when(commonCodeService).deleteGroup("PRIORITY");

        // when & then
        mockMvc.perform(delete("/api/v1/system/codes/groups/PRIORITY"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("특정 그룹의 공통 코드 리스트 조회 - 성공")
    void getCodesByGroup_ValidGroupId_ReturnsList() throws Exception {
        // given
        CommonCodeDTO codeDto = CommonCodeDTO.builder()
                .id(1L)
                .groupId("PRIORITY")
                .codeId("HIGH")
                .codeName("높음")
                .build();
        given(commonCodeService.getCodesByGroup("PRIORITY")).willReturn(List.of(codeDto));

        // when & then
        mockMvc.perform(get("/api/v1/system/codes/groups/PRIORITY/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].codeId").value("HIGH"))
                .andExpect(jsonPath("$[0].codeName").value("높음"));
    }

    @Test
    @DisplayName("공통 코드 생성 - 성공")
    void createCode_ValidDto_ReturnsCreated() throws Exception {
        // given
        CommonCodeDTO inputDto = CommonCodeDTO.builder()
                .groupId("PRIORITY")
                .codeId("EMERGENCY")
                .codeName("긴급")
                .build();
        given(commonCodeService.createCode(any(CommonCodeDTO.class))).willReturn(inputDto);

        // when & then
        mockMvc.perform(post("/api/v1/system/codes/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inputDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.codeId").value("EMERGENCY"));
    }

    @Test
    @DisplayName("공통 코드 수정 - 성공")
    void updateCode_ValidDto_ReturnsUpdatedDto() throws Exception {
        // given
        CommonCodeDTO updateDto = CommonCodeDTO.builder()
                .codeName("매우 높음")
                .isActive(true)
                .build();
        CommonCodeDTO resultDto = CommonCodeDTO.builder()
                .id(1L)
                .codeName("매우 높음")
                .build();
        given(commonCodeService.updateCode(any(Long.class), any(CommonCodeDTO.class))).willReturn(resultDto);

        // when & then
        mockMvc.perform(put("/api/v1/system/codes/items/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.codeName").value("매우 높음"));
    }

    @Test
    @DisplayName("특정 공통 코드 삭제 - 성공")
    void deleteCode_ValidId_ReturnsNoContent() throws Exception {
        // given
        doNothing().when(commonCodeService).deleteCode(1L);

        // when & then
        mockMvc.perform(delete("/api/v1/system/codes/items/1"))
                .andExpect(status().isNoContent());
    }
}

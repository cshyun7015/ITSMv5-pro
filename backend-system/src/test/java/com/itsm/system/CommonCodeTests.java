package com.itsm.system;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class CommonCodeTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "ADMIN")
    @DisplayName("공통 코드 그룹 및 코드 항목 연쇄 생성/조회/삭제 테스트")
    void testCommonCodeLifecycle() throws Exception {
        String groupId = "TEST_PRIORITY";
        
        // 1. Create Group
        CodeGroupDTO groupDto = CodeGroupDTO.builder()
                .groupId(groupId)
                .name("Test Priority")
                .description("Priority for tests")
                .isSystem(false)
                .build();
        
        mockMvc.perform(post("/v1/system/codes/groups")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(groupDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.groupId").value(groupId));

        // 2. Create Code Items
        CommonCodeDTO highCode = CommonCodeDTO.builder()
                .groupId(groupId)
                .codeId("HIGH")
                .codeName("High")
                .sortOrder(1)
                .isActive(true)
                .build();
        
        var codeResult = mockMvc.perform(post("/v1/system/codes/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(highCode)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.codeId").value("HIGH"))
                .andReturn();
        
        String responseContent = codeResult.getResponse().getContentAsString();
        Long codePk = objectMapper.readTree(responseContent).path("data").path("id").asLong();

        // 3. List Items by Group
        mockMvc.perform(get("/v1/system/codes/groups/" + groupId + "/items"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data").isArray());

        // 4. Delete Code & Group
        mockMvc.perform(delete("/v1/system/codes/items/" + codePk))
                .andExpect(status().isOk());
        
        mockMvc.perform(delete("/v1/system/codes/groups/" + groupId))
                .andExpect(status().isOk());
        
        // 5. Final Check
        mockMvc.perform(get("/v1/system/codes/groups/" + groupId))
                .andExpect(status().isNotFound());
    }
}

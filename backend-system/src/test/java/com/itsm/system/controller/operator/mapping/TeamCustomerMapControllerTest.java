package com.itsm.system.controller.operator.mapping;

import com.itsm.system.service.operator.mapping.TeamCustomerMapService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TeamCustomerMapController.class)
class TeamCustomerMapControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TeamCustomerMapService mappingService;

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

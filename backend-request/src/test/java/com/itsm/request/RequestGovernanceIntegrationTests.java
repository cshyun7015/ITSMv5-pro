package com.itsm.request;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class RequestGovernanceIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    // Constants for multi-tenant simulation
    private static final String CUST_A = "CUST_A";
    private static final String CUST_B = "CUST_B";
    private static final String MSP_ALPHA = "MSP_ALPHA";
    private static final String MSP_BETA = "MSP_BETA";

    private static final String USER_A1 = "user_a1";
    private static final String USER_A2 = "user_a2";
    private static final String USER_B1 = "user_b1";
    private static final String OPER_ALPHA1 = "oper_alpha1";
    private static final String ADMIN_USER = "admin_user";

    @Test
    @DisplayName("G-1: Create Request with All Columns & Priority Calculation")
    void testCreateRequest_FullFields() throws Exception {
        RequestDTO dto = RequestDTO.builder()
                .title("Full Column Test")
                .description("Detailed description for all columns")
                .companyId(CUST_A)
                .mspId(MSP_ALPHA)
                .requesterId(USER_A1)
                .srTypeCode("SERVICE_REQUEST")
                .srCategoryCode("CAT_01")
                .srImpactCode("HIGH")
                .srUrgencyCode("HIGH")
                .srSourceCode("PORTAL")
                .serviceId("SVC_001")
                .ciId("CI_SRV_001")
                .expectedAt(LocalDateTime.now().plusDays(3))
                .build();

        mockMvc.perform(post("/api/v1/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNotEmpty())
                .andExpect(jsonPath("$.reqNumber").value(startsWith("SR-")))
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.priority").value("P1"))
                .andExpect(jsonPath("$.title").value("Full Column Test"))
                .andExpect(jsonPath("$.description").value("Detailed description for all columns"))
                .andExpect(jsonPath("$.companyId").value(CUST_A))
                .andExpect(jsonPath("$.mspId").value(MSP_ALPHA))
                .andExpect(jsonPath("$.srTypeCode").value("SERVICE_REQUEST"))
                .andExpect(jsonPath("$.srCategoryCode").value("CAT_01"))
                .andExpect(jsonPath("$.srImpactCode").value("HIGH"))
                .andExpect(jsonPath("$.srUrgencyCode").value("HIGH"))
                .andExpect(jsonPath("$.srSourceCode").value("PORTAL"))
                .andExpect(jsonPath("$.serviceId").value("SVC_001"))
                .andExpect(jsonPath("$.ciId").value("CI_SRV_001"))
                .andExpect(jsonPath("$.requesterId").value(USER_A1))
                .andExpect(jsonPath("$.slaTargetAt").isNotEmpty())
                .andExpect(jsonPath("$.createdAt").isNotEmpty());

        // P2 (HIGH/MEDIUM)
        dto.setSrUrgencyCode("MEDIUM");
        mockMvc.perform(post("/api/v1/request").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)))
                .andExpect(jsonPath("$.priority").value("P2"));

        // P3 (HIGH/LOW)
        dto.setSrUrgencyCode("LOW");
        mockMvc.perform(post("/api/v1/request").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)))
                .andExpect(jsonPath("$.priority").value("P3"));

        // P4 (LOW/LOW)
        dto.setSrImpactCode("LOW");
        dto.setSrUrgencyCode("LOW");
        mockMvc.perform(post("/api/v1/request").contentType(MediaType.APPLICATION_JSON).content(objectMapper.writeValueAsString(dto)))
                .andExpect(jsonPath("$.priority").value("P4"));
    }

    @Test
    @DisplayName("G-2: Multi-Tenant Role-based Visibility Review")
    void testPermissionBasedInquiry() throws Exception {
        createRequest(CUST_A, MSP_ALPHA, USER_A1, "Ticket A1");
        createRequest(CUST_A, MSP_BETA, USER_A2, "Ticket A2");
        createRequest(CUST_B, MSP_ALPHA, USER_B1, "Ticket B1");

        // Customer User Perspective (CustA)
        mockMvc.perform(get("/api/v1/request")
                .header("X-Company-ID", CUST_A)
                .header("X-User-Role", "ROLE_USER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].companyId", everyItem(is(CUST_A))));

        // Operator Perspective (MSP_ALPHA)
        mockMvc.perform(get("/api/v1/request")
                .header("X-Company-ID", "MSP")
                .header("X-MSP-ID", MSP_ALPHA)
                .header("X-User-Role", "ROLE_OPER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(2)))
                .andExpect(jsonPath("$.content[*].mspId", everyItem(is(MSP_ALPHA))));

        // Operator Perspective (MSP_BETA)
        mockMvc.perform(get("/api/v1/request")
                .header("X-Company-ID", "MSP")
                .header("X-MSP-ID", MSP_BETA)
                .header("X-User-Role", "ROLE_OPER"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)))
                .andExpect(jsonPath("$.content[0].mspId").value(MSP_BETA));

        // Admin Perspective (Global)
        mockMvc.perform(get("/api/v1/request")
                .header("X-Company-ID", "MSP")
                .header("X-User-Role", "ROLE_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(3)));
        
        // Cross-tenant Exploit Attempt
        MvcResult resB = mockMvc.perform(get("/api/v1/request").header("X-Company-ID", CUST_B)).andReturn();
        String contentB = resB.getResponse().getContentAsString();
        Integer idB = (Integer) com.jayway.jsonpath.JsonPath.read(contentB, "$.content[0].id");

        mockMvc.perform(get("/api/v1/request/" + idB)
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("G-3: Comprehensive Status Life Cycle & Reopen Counter")
    void testStatusLifecycleTransitions() throws Exception {
        RequestDTO created = createRequest(CUST_A, MSP_ALPHA, USER_A1, "Lifecycle Test");
        Long id = created.getId();

        updateStatus(id, "IN_PROGRESS", null, null);
        
        RequestDTO updateDto = created;
        updateDto.setStatus("RESOLVED");
        mockMvc.perform(put("/api/v1/request/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto))
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Resolution code and text are required")));

        updateStatus(id, "RESOLVED", "FIXED", "Solution provided.");
        updateStatus(id, "CLOSED", null, null);

        updateDto.setStatus("OPEN");
        mockMvc.perform(put("/api/v1/request/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto))
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isForbidden());

        RequestDTO req2 = createRequest(CUST_A, MSP_ALPHA, USER_A1, "Reopen Test");
        updateStatus(req2.getId(), "RESOLVED", "FIXED", "First fix.");
        
        RequestDTO reOpenDto = req2;
        reOpenDto.setStatus("IN_PROGRESS");
        mockMvc.perform(put("/api/v1/request/" + req2.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(reOpenDto))
                .header("X-Company-ID", "MSP"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reopenCount").value(1));
        
        // CANCELLED check
        RequestDTO req3 = createRequest(CUST_B, MSP_BETA, USER_B1, "Cancel Test");
        updateStatus(req3.getId(), "CANCELLED", null, null);
        req3.setStatus("OPEN");
        mockMvc.perform(put("/api/v1/request/" + req3.getId())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req3))
                .header("X-Company-ID", CUST_B))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("G-4: History Audit & Comments/Attachments")
    void testAuditAndSocialFeatures() throws Exception {
        RequestDTO req = createRequest(CUST_A, MSP_ALPHA, USER_A1, "Audit Test");
        Long id = req.getId();

        req.setSrImpactCode("LOW");
        req.setSrUrgencyCode("LOW");
        req.setUpdatedBy(OPER_ALPHA1);
        mockMvc.perform(put("/api/v1/request/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(req))
                .header("X-Company-ID", "MSP")
                .header("X-User-Role", "ROLE_OPER")
                .header("X-MSP-ID", MSP_ALPHA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value("P4"));

        mockMvc.perform(get("/api/v1/request/" + id + "/history")
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThan(0))))
                .andExpect(jsonPath("$[*].fieldName", hasItems("srImpactCode", "srUrgencyCode")));

        RequestCommentDTO commentDto = RequestCommentDTO.builder()
                .content("Test Comment")
                .authorId(USER_A1)
                .isInternal(false)
                .build();
        mockMvc.perform(post("/api/v1/request/" + id + "/comments")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.content").value("Test Comment"));

        mockMvc.perform(get("/api/v1/request/" + id + "/comments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        MockMultipartFile file = new MockMultipartFile("file", "test.txt", "text/plain", "Hello World".getBytes());
        MvcResult attachRes = mockMvc.perform(multipart("/api/v1/request/" + id + "/attachments")
                .file(file))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.fileName").value("test.txt"))
                .andReturn();
        
        String attachContent = attachRes.getResponse().getContentAsString();
        Integer attachId = (Integer) com.jayway.jsonpath.JsonPath.read(attachContent, "$.id");

        mockMvc.perform(get("/api/v1/request/attachments/" + attachId + "/download"))
                .andExpect(status().isOk())
                .andExpect(content().bytes("Hello World".getBytes()));
    }

    @Test
    @DisplayName("G-5: Search Filters & Pagination")
    void testSearchAndPagination() throws Exception {
        createRequest(CUST_A, MSP_ALPHA, USER_A1, "Unique Search Keyword");
        
        mockMvc.perform(get("/api/v1/request")
                .param("title", "Unique Search")
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/v1/request")
                .param("requesterId", USER_A1)
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content", hasSize(1)));

        mockMvc.perform(get("/api/v1/request")
                .param("page", "0")
                .param("size", "5")
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size").value(5));

        RequestDTO req = createRequest(CUST_A, MSP_ALPHA, USER_A1, "To Delete");
        mockMvc.perform(delete("/api/v1/request/" + req.getId())
                .header("X-Company-ID", CUST_B))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/v1/request/" + req.getId())
                .header("X-Company-ID", CUST_A))
                .andExpect(status().isNoContent());
    }

    // --- Helper Methods ---

    private RequestDTO createRequest(String companyId, String mspId, String requesterId, String title) throws Exception {
        RequestDTO dto = RequestDTO.builder()
                .title(title)
                .companyId(companyId)
                .mspId(mspId)
                .requesterId(requesterId)
                .srTypeCode("SR")
                .srImpactCode("MEDIUM")
                .srUrgencyCode("MEDIUM")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/request")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andReturn();

        return objectMapper.readValue(result.getResponse().getContentAsString(), RequestDTO.class);
    }

    private void updateStatus(Long id, String status, String resCode, String resText) throws Exception {
        MvcResult res = mockMvc.perform(get("/api/v1/request/" + id).header("X-Company-ID", "MSP")).andReturn();
        RequestDTO current = objectMapper.readValue(res.getResponse().getContentAsString(), RequestDTO.class);
        
        current.setStatus(status);
        if (resCode != null) current.setSrResolutionCode(resCode);
        if (resText != null) current.setResolutionText(resText);
        current.setUpdatedBy(ADMIN_USER);

        mockMvc.perform(put("/api/v1/request/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(current))
                .header("X-Company-ID", "MSP")
                .header("X-User-Role", "ROLE_ADMIN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value(status));
    }
}

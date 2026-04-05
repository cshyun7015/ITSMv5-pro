package com.itsm.request;

import com.itsm.request.dto.RequestDTO;
import com.itsm.request.dto.RequestHistoryDTO;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
public class RequestGovernanceIntegrationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    @DisplayName("G-1: Multi-Tenant Data Isolation (CustA vs CustB, MSP1 vs MSP2)")
    void testMultiTenantIsolation() {
        restTemplate.postForObject("/api/v1/request", createBasicDTO("Request for CustA", "CustA", "MSP1"), RequestDTO.class);
        restTemplate.postForObject("/api/v1/request", createBasicDTO("Request for CustB", "CustB", "MSP2"), RequestDTO.class);

        HttpHeaders headersA = createHeaders("CustA", "ROLE_USER", null);
        ResponseEntity<Object> responseA = restTemplate.exchange("/api/v1/request", HttpMethod.GET, new HttpEntity<>(headersA), new ParameterizedTypeReference<Object>() {});
        assertThat(responseA.getBody().toString()).contains("Request for CustA");
        assertThat(responseA.getBody().toString()).doesNotContain("Request for CustB");
    }

    @Test
    @DisplayName("G-2: Status Lifecycle Transitions & Audit Trail")
    void testStatusLifecycle() {
        RequestDTO req = createBasicDTO("Status Cycle Test", "CustA", "MSP1");
        HttpHeaders adminHeader = createHeaders("MSP", "ROLE_ADMIN", "MSP1");
        
        RequestDTO created = restTemplate.postForObject("/api/v1/request", req, RequestDTO.class);
        Long requestId = created.getId();

        created.setStatus("ASSIGNED");
        created.setAssigneeId("operator1");
        created.setUpdatedBy("admin");
        restTemplate.exchange("/api/v1/request/" + requestId, HttpMethod.PUT, new HttpEntity<>(created, adminHeader), RequestDTO.class);

        created.setStatus("RESOLVED");
        ResponseEntity<Map<String, Object>> errorRes = restTemplate.exchange("/api/v1/request/" + requestId, HttpMethod.PUT, new HttpEntity<>(created, adminHeader), new ParameterizedTypeReference<Map<String, Object>>() {});
        assertThat(errorRes.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);

        created.setSrResolutionCode("FIXED");
        created.setResolutionText("Fixed with Security");
        RequestDTO resolved = restTemplate.exchange("/api/v1/request/" + requestId, HttpMethod.PUT, new HttpEntity<>(created, adminHeader), RequestDTO.class).getBody();
        assertThat(resolved.getStatus()).isEqualTo("RESOLVED");
    }

    @Test
    @DisplayName("G-3: Multi-User Perspective Isolation within Company")
    void testUserPerspectiveIsolation() {
        restTemplate.postForObject("/api/v1/request", 
                RequestDTO.builder().title("UserA Ticket").companyId("CustA").requesterId("UserA").srTypeCode("SR").build(), 
                RequestDTO.class);
        restTemplate.postForObject("/api/v1/request", 
                RequestDTO.builder().title("UserB Ticket").companyId("CustA").requesterId("UserB").srTypeCode("SR").build(), 
                RequestDTO.class);

        HttpHeaders headersA = createHeaders("CustA", "ROLE_USER", null);
        ResponseEntity<Object> resA_Own = restTemplate.exchange("/api/v1/request?requesterId=UserA", HttpMethod.GET, new HttpEntity<>(headersA), new ParameterizedTypeReference<Object>() {});
        assertThat(resA_Own.getBody().toString()).contains("UserA Ticket");
        assertThat(resA_Own.getBody().toString()).doesNotContain("UserB Ticket");

        ResponseEntity<Object> resA_Shared = restTemplate.exchange("/api/v1/request", HttpMethod.GET, new HttpEntity<>(headersA), new ParameterizedTypeReference<Object>() {});
        assertThat(resA_Shared.getBody().toString()).contains("UserA Ticket");
        assertThat(resA_Shared.getBody().toString()).contains("UserB Ticket");
    }

    @Test
    @DisplayName("G-4: Strict Cross-Company Exploit Prevention (User A vs User B)")
    void testCrossCompanyExploitPrevention() {
        // --- PREPARE DATA ---
        // User A from Company A
        RequestDTO reqA = restTemplate.postForObject("/api/v1/request", 
                createBasicDTO("Company A Secret Ticket", "CustA", "MSP1"), RequestDTO.class);
        // User B from Company B
        RequestDTO reqB = restTemplate.postForObject("/api/v1/request", 
                createBasicDTO("Company B Secret Ticket", "CustB", "MSP1"), RequestDTO.class);

        Long idA = reqA.getId();
        Long idB = reqB.getId();

        // --- ATTACK Scenario 1: User B tries to view User A's ticket ID directly ---
        HttpHeaders headersB = createHeaders("CustB", "ROLE_USER", null);
        ResponseEntity<Map<String, Object>> attackView = restTemplate.exchange(
                "/api/v1/request/" + idA, HttpMethod.GET, new HttpEntity<>(headersB), new ParameterizedTypeReference<Map<String, Object>>() {});
        
        assertThat(attackView.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        assertThat(attackView.getBody().get("message").toString()).contains("access requests from other companies");

        // --- ATTACK Scenario 2: User B tries to DELETE User A's ticket ---
        ResponseEntity<Map<String, Object>> attackDelete = restTemplate.exchange(
                "/api/v1/request/" + idA, HttpMethod.DELETE, new HttpEntity<>(headersB), new ParameterizedTypeReference<Map<String, Object>>() {});
        
        assertThat(attackDelete.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // --- NORMAL Scenario: User B views their own ticket ---
        ResponseEntity<RequestDTO> normalView = restTemplate.exchange(
                "/api/v1/request/" + idB, HttpMethod.GET, new HttpEntity<>(headersB), RequestDTO.class);
        assertThat(normalView.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(normalView.getBody().getTitle()).isEqualTo("Company B Secret Ticket");
    }

    private HttpHeaders createHeaders(String companyId, String role, String mspId) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Company-ID", companyId);
        headers.set("X-User-Role", role);
        if (mspId != null) headers.set("X-MSP-ID", mspId);
        return headers;
    }

    private RequestDTO createBasicDTO(String title, String companyId, String mspId) {
        return RequestDTO.builder()
                .title(title)
                .description("Automated security testing.")
                .companyId(companyId)
                .mspId(mspId)
                .srTypeCode("SERVICE_REQUEST")
                .requesterId("tester")
                .build();
    }
}

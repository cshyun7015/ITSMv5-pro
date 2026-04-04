package com.itsm.system;

import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class OperatorOrgTests {

    @Autowired
    private TestRestTemplate restTemplate;

    private static Long companyId;
    private static Long teamId;
    private static Long operatorId;

    @Test
    @Order(1)
    @DisplayName("MSP(Company) CRUD Test")
    void operatorCompanyCRUDTest() {
        // 1. Create
        OperatorCompanyDTO createDto = OperatorCompanyDTO.builder()
                .operatorCompanyId("MSP-TEST-" + System.currentTimeMillis())
                .name("Test MSP Company")
                .businessNumber("111-22-33333")
                .representativeName("Test CEO")
                .status("ACTIVE")
                .build();

        ResponseEntity<OperatorCompanyDTO> createResponse = restTemplate.postForEntity(
                "/api/v1/organization/operators/companies", createDto, OperatorCompanyDTO.class);
        
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(createResponse.getBody().getId()).isNotNull();
        companyId = createResponse.getBody().getId();

        // 2. Read
        ResponseEntity<OperatorCompanyDTO> getResponse = restTemplate.getForEntity(
                "/api/v1/organization/operators/companies/" + companyId, OperatorCompanyDTO.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Test MSP Company");
    }

    @Test
    @Order(2)
    @DisplayName("Operator Team CRUD Test")
    void operatorTeamCRUDTest() {
        assertThat(companyId).isNotNull();

        // 1. Create Team
        OperatorTeamDTO teamDto = OperatorTeamDTO.builder()
                .name("Cloud Reliability Team")
                .description("Cloud Infra Management")
                .build();

        ResponseEntity<OperatorTeamDTO> createResponse = restTemplate.postForEntity(
                "/api/v1/organization/operators/companies/" + companyId + "/teams", teamDto, OperatorTeamDTO.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        teamId = createResponse.getBody().getId();
        assertThat(teamId).isNotNull();

        // 2. List Teams by Company
        ResponseEntity<List> listResponse = restTemplate.getForEntity(
                "/api/v1/organization/operators/companies/" + companyId + "/teams", List.class);
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).isNotEmpty();
    }

    @Test
    @Order(3)
    @DisplayName("Operator CRUD & Validation Test")
    void operatorCRUDTest() {
        assertThat(teamId).isNotNull();

        // 1. Create Operator (Normal)
        OperatorDTO opDto = OperatorDTO.builder()
                .userId("op_tester_" + System.currentTimeMillis())
                .password("Itsm2026!@") // Mandatory password
                .name("John Tester")
                .email("john@msp.com")
                .role("ROLE_OPER") // Valid code
                .build();

        ResponseEntity<OperatorDTO> createResponse = restTemplate.postForEntity(
                "/api/v1/organization/operators/teams/" + teamId + "/operators", opDto, OperatorDTO.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK); // Current controller returns 200/201
        operatorId = createResponse.getBody().getId();
        assertThat(operatorId).isNotNull();

        // 2. Validate password requirement (Failure Test)
        OperatorDTO noPassDto = OperatorDTO.builder()
                .userId("fail_user")
                .name("No Pass User")
                .role("ROLE_OPER")
                .build();
        ResponseEntity<Map> failResponse = restTemplate.postForEntity(
                "/api/v1/organization/operators/teams/" + teamId + "/operators", noPassDto, Map.class);
        assertThat(failResponse.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);

        // 3. Validate role existence (Failure Test)
        OperatorDTO invalidRoleDto = OperatorDTO.builder()
                .userId("fake_role_user")
                .password("Itsm2026!@")
                .name("Fake Role User")
                .role("ROLE_HACKER") // Invalid code
                .build();
        ResponseEntity<Map> roleFailResponse = restTemplate.postForEntity(
                "/api/v1/organization/operators/teams/" + teamId + "/operators", invalidRoleDto, Map.class);
        assertThat(roleFailResponse.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @Test
    @Order(4)
    @DisplayName("Operator Mapping Verification")
    void mappingVerificationTest() {
        assertThat(operatorId).isNotNull();
        assertThat(teamId).isNotNull();

        // Verify operator is in the team list
        ResponseEntity<List> teamOpsResponse = restTemplate.getForEntity(
                "/api/v1/organization/operators/teams/" + teamId + "/operators", List.class);
        
        assertThat(teamOpsResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> ops = (List<Map<String, Object>>) teamOpsResponse.getBody();
        boolean found = ops.stream().anyMatch(o -> o.get("id").toString().equals(operatorId.toString()));
        assertThat(found).isTrue();
    }
}

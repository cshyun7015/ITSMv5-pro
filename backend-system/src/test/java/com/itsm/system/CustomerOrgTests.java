package com.itsm.system;

import com.itsm.system.dto.organization.customer.CustomerCompanyDTO;
import com.itsm.system.dto.organization.customer.CustomerTeamDTO;
import com.itsm.system.dto.organization.customer.CustomerUserDTO;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class CustomerOrgTests {

    @Autowired
    private TestRestTemplate restTemplate;

    private static Long companyId;
    private static Long teamId;
    private static Long userId;

    private final String BASE_URL = "/api/v1/customer-governance";

    @Test
    @Order(1)
    @DisplayName("Customer Company CRUD Test")
    void customerCompanyCRUDTest() {
        // 1. Create
        CustomerCompanyDTO createDto = CustomerCompanyDTO.builder()
                .customerId("CUST-ORG-" + System.currentTimeMillis())
                .name("Global Megacorp")
                .businessNumber("999-88-77777")
                .representativeName("CEO Park")
                .status("ACTIVE")
                .build();

        ResponseEntity<CustomerCompanyDTO> createResponse = restTemplate.postForEntity(
                BASE_URL + "/companies", createDto, CustomerCompanyDTO.class);
        
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        companyId = createResponse.getBody().getId();
        assertThat(companyId).isNotNull();

        // 2. Read
        ResponseEntity<CustomerCompanyDTO> getResponse = restTemplate.getForEntity(
                BASE_URL + "/companies/" + companyId, CustomerCompanyDTO.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Global Megacorp");
    }

    @Test
    @Order(2)
    @DisplayName("Customer Team CRUD Test")
    void customerTeamCRUDTest() {
        assertThat(companyId).isNotNull();

        // 1. Create Team
        CustomerTeamDTO teamDto = CustomerTeamDTO.builder()
                .name("General Affairs Team")
                .description("Handles company internal infrastructure")
                .build();

        ResponseEntity<CustomerTeamDTO> createResponse = restTemplate.postForEntity(
                BASE_URL + "/companies/" + companyId + "/teams", teamDto, CustomerTeamDTO.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        teamId = createResponse.getBody().getId();
        assertThat(teamId).isNotNull();

        // 2. List Teams
        ResponseEntity<List> listResponse = restTemplate.getForEntity(
                BASE_URL + "/companies/" + companyId + "/teams", List.class);
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).isNotEmpty();
    }

    @Test
    @Order(3)
    @DisplayName("Customer User CRUD Test")
    void customerUserCRUDTest() {
        assertThat(teamId).isNotNull();

        // 1. Create User
        CustomerUserDTO userDto = CustomerUserDTO.builder()
                .userId("cust_user_" + System.currentTimeMillis())
                .password("ItsmCustomer123!")
                .name("Alice Customer")
                .email("alice@megacorp.com")
                .role("ROLE_CUS_USER")
                .isActive(true)
                .build();

        ResponseEntity<CustomerUserDTO> createResponse = restTemplate.postForEntity(
                BASE_URL + "/teams/" + teamId + "/users", userDto, CustomerUserDTO.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        userId = createResponse.getBody().getId();
        assertThat(userId).isNotNull();

        // 2. Get User
        ResponseEntity<CustomerUserDTO> getResponse = restTemplate.getForEntity(
                BASE_URL + "/users/" + userId, CustomerUserDTO.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Alice Customer");
    }
}

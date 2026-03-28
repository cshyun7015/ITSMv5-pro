package com.itsm.system;

import com.itsm.system.dto.company.CompanyRequestDTO;
import com.itsm.system.dto.company.CompanyResponseDTO;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class CompanyCRUDTests {

    @Autowired
    private TestRestTemplate restTemplate;

    private static Long savedId;
    private final String BASE_URL = "/api/v1/system/companies";

    @Test
    @Order(1)
    void createCompanyTest() {
        CompanyRequestDTO request = CompanyRequestDTO.builder()
                .companyId("COMP-001")
                .name("Test Company")
                .businessNumber("123-45-67890")
                .status("ACTIVE")
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Company-ID", "COMP-001");
        HttpEntity<CompanyRequestDTO> entity = new HttpEntity<>(request, headers);

        ResponseEntity<CompanyResponseDTO> response = restTemplate.postForEntity(BASE_URL, entity, CompanyResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Test Company");
        savedId = response.getBody().getId();
    }

    @Test
    @Order(2)
    void getCompanyTest() {
        ResponseEntity<CompanyResponseDTO> response = restTemplate.getForEntity(BASE_URL + "/" + savedId, CompanyResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getCompanyId()).isEqualTo("COMP-001");
    }

    @Test
    @Order(3)
    void updateCompanyTest() {
        CompanyRequestDTO updateRequest = CompanyRequestDTO.builder()
                .name("Updated Company Name")
                .status("INACTIVE")
                .build();

        HttpEntity<CompanyRequestDTO> entity = new HttpEntity<>(updateRequest);
        ResponseEntity<CompanyResponseDTO> response = restTemplate.exchange(BASE_URL + "/" + savedId, HttpMethod.PUT, entity, CompanyResponseDTO.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getName()).isEqualTo("Updated Company Name");
        assertThat(response.getBody().getStatus()).isEqualTo("INACTIVE");
    }

    @Test
    @Order(4)
    void deleteCompanyTest() {
        restTemplate.delete(BASE_URL + "/" + savedId);

        ResponseEntity<CompanyResponseDTO> response = restTemplate.getForEntity(BASE_URL + "/" + savedId, CompanyResponseDTO.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}

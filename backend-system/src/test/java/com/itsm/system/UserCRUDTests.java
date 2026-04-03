package com.itsm.system;

import com.itsm.system.dto.user.UserRequestDTO;
import com.itsm.system.dto.user.UserResponseDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class UserCRUDTests {

    @Autowired
    private TestRestTemplate restTemplate;

    private String testCompanyId = "TEST-COMP-USER";

    @BeforeEach
    void setUp() {
        // Preparation: Ensure a company exists if needed (skipped here if DB auto-handles)
    }

    @Test
    void userCRUDLifecycleTest() {
        // 1. Create User
        UserRequestDTO createDto = UserRequestDTO.builder()
                .userId("testuser1")
                .password("pass123")
                .name("Test User One")
                .email("user1@test.com")
                .role("ROLE_USER")
                .companyId(testCompanyId)
                .isActive(true)
                .build();

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Company-ID", testCompanyId);
        HttpEntity<UserRequestDTO> createRequest = new HttpEntity<>(createDto, headers);

        ResponseEntity<UserResponseDTO> createResponse = restTemplate.postForEntity(
                "/api/v1/system/users", createRequest, UserResponseDTO.class);

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody()).isNotNull();
        Long id = createResponse.getBody().getId();
        assertThat(createResponse.getBody().getUserId()).isEqualTo("testuser1");

        // 2. Get User
        ResponseEntity<UserResponseDTO> getResponse = restTemplate.getForEntity(
                "/api/v1/system/users/" + id, UserResponseDTO.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Test User One");

        // 3. List Users by Company
        HttpEntity<Void> listRequest = new HttpEntity<>(headers);
        ResponseEntity<List> listResponse = restTemplate.exchange(
                "/api/v1/system/users", HttpMethod.GET, listRequest, List.class);
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).isNotEmpty();

        // 4. Update User
        UserRequestDTO updateDto = UserRequestDTO.builder()
                .name("Updated User Name")
                .isActive(false)
                .build();
        HttpEntity<UserRequestDTO> updateRequest = new HttpEntity<>(updateDto, headers);
        ResponseEntity<UserResponseDTO> updateResponse = restTemplate.exchange(
                "/api/v1/system/users/" + id, HttpMethod.PUT, updateRequest, UserResponseDTO.class);
        assertThat(updateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(updateResponse.getBody().getName()).isEqualTo("Updated User Name");
        assertThat(updateResponse.getBody().getIsActive()).isFalse();

        // 5. Delete User
        restTemplate.delete("/api/v1/system/users/" + id);
        ResponseEntity<UserResponseDTO> finalGetResponse = restTemplate.getForEntity(
                "/api/v1/system/users/" + id, UserResponseDTO.class);
        assertThat(finalGetResponse.getStatusCode()).isIn(HttpStatus.NOT_FOUND, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

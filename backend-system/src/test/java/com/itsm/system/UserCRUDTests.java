package com.itsm.system;

import com.itsm.system.dto.user.UserRequestDTO;
import com.itsm.system.dto.user.UserResponseDTO;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class UserCRUDTests {

    @Autowired
    private TestRestTemplate restTemplate;

    private String testCompanyId = "TEST-COMP-USER";

    @BeforeEach
    void setUp() {
        // Create Company for testing to satisfy foreign key constraint
        Map<String, String> companyDto = Map.of(
            "companyId", testCompanyId,
            "name", "Test User Company",
            "status", "ACTIVE"
        );
        restTemplate.postForEntity("/api/v1/system/companies", companyDto, Object.class);
    }
    
    @AfterEach
    void tearDown() {
        // Cleanup could be added here if needed
    }

    @Test
    void userCRUDLifecycleTest() {
        String uniqueUserId = "user_" + System.currentTimeMillis();
        // 1. Create User
        UserRequestDTO createDto = UserRequestDTO.builder()
                .userId(uniqueUserId)
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
        assertThat(createResponse.getBody().getUserId()).isEqualTo(uniqueUserId);

        // 2. Get User
        ResponseEntity<UserResponseDTO> getResponse = restTemplate.getForEntity(
                "/api/v1/system/users/" + id, UserResponseDTO.class);
        assertThat(getResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(getResponse.getBody().getName()).isEqualTo("Test User One");

        // 3. List Users by Company
        HttpEntity<Void> listRequest = new HttpEntity<>(headers);
        ResponseEntity<Map<String, Object>> listResponse = restTemplate.exchange(
                "/api/v1/system/users?companyId=" + testCompanyId, HttpMethod.GET, listRequest, new ParameterizedTypeReference<Map<String, Object>>() {});
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<?> content = (List<?>) listResponse.getBody().get("content");
        assertThat(content).isNotEmpty();

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

package com.itsm.request;

import com.itsm.request.dto.RequestCommentDTO;
import com.itsm.request.dto.RequestDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class RequestCRUDTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testRequestLifecycle() {
        String companyId = "COMP1";
        
        // 1. Create Request
        RequestDTO createDto = RequestDTO.builder()
                .companyId(companyId)
                .title("Network Access Issue")
                .description("Unable to connect to VPN from home office.")
                .priority("HIGH")
                .requesterId("USER01")
                .build();
        
        ResponseEntity<RequestDTO> createResponse = restTemplate.postForEntity(
                "/api/v1/request", createDto, RequestDTO.class);
        
        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(createResponse.getBody().getReqNumber()).startsWith("REQ-");
        Long requestId = createResponse.getBody().getId();

        // 2. Add Comment
        RequestCommentDTO commentDto = RequestCommentDTO.builder()
                .authorId("AGENT01")
                .content("Investigating the VPN logs.")
                .isInternal(true)
                .build();
        
        ResponseEntity<RequestCommentDTO> commentResponse = restTemplate.postForEntity(
                "/api/v1/request/" + requestId + "/comments", commentDto, RequestCommentDTO.class);
        
        assertThat(commentResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(commentResponse.getBody().getContent()).isEqualTo("Investigating the VPN logs.");

        // 3. List Requests (with X-Company-ID)
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Company-ID", companyId);
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<List<RequestDTO>> listResponse = restTemplate.exchange(
                "/api/v1/request", HttpMethod.GET, entity, new ParameterizedTypeReference<List<RequestDTO>>() {});
        
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).hasSizeGreaterThan(0);

        // 4. Delete Request
        restTemplate.delete("/api/v1/request/" + requestId);
        
        ResponseEntity<List<RequestDTO>> listAfterDelete = restTemplate.exchange(
                "/api/v1/request", HttpMethod.GET, entity, new ParameterizedTypeReference<List<RequestDTO>>() {});
        
        boolean found = listAfterDelete.getBody().stream().anyMatch(r -> r.getId().equals(requestId));
        assertThat(found).isFalse();
    }
}

package com.itsm.system;

import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class CommonCodeTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Test
    void testCommonCodeLifecycle() {
        String groupId = "TEST_PRIORITY";
        
        // 1. Create Group
        CodeGroupDTO groupDto = CodeGroupDTO.builder()
                .groupId(groupId)
                .name("Test Priority")
                .description("Priority for tests")
                .isSystem(false)
                .build();
        
        ResponseEntity<CodeGroupDTO> groupResponse = restTemplate.postForEntity(
                "/api/v1/system/codes/groups", groupDto, CodeGroupDTO.class);
        
        assertThat(groupResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(groupResponse.getBody().getGroupId()).isEqualTo(groupId);

        // 2. Create Code Items
        CommonCodeDTO highCode = CommonCodeDTO.builder()
                .groupId(groupId)
                .codeId("HIGH")
                .codeName("High")
                .sortOrder(1)
                .isActive(true)
                .build();
        
        ResponseEntity<CommonCodeDTO> codeResponse = restTemplate.postForEntity(
                "/api/v1/system/codes/items", highCode, CommonCodeDTO.class);
        
        assertThat(codeResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(codeResponse.getBody().getCodeId()).isEqualTo("HIGH");

        // 3. List Items by Group
        ResponseEntity<List> listResponse = restTemplate.getForEntity(
                "/api/v1/system/codes/groups/" + groupId + "/items", List.class);
        
        assertThat(listResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(listResponse.getBody()).hasSize(1);

        // 4. Update Code
        Long codePk = codeResponse.getBody().getId();
        highCode.setCodeName("Critical (High)");
        restTemplate.put("/api/v1/system/codes/items/" + codePk, highCode);
        
        // 5. Delete Code & Group
        restTemplate.delete("/api/v1/system/codes/items/" + codePk);
        restTemplate.delete("/api/v1/system/codes/groups/" + groupId);
        
        ResponseEntity<CodeGroupDTO> finalCheck = restTemplate.getForEntity(
                "/api/v1/system/codes/groups/" + groupId, CodeGroupDTO.class);
        assertThat(finalCheck.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}

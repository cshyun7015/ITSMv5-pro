package com.itsm.system.integration.organization;

import com.itsm.system.domain.code.CodeGroup;
import com.itsm.system.domain.code.CodeGroupRepository;
import com.itsm.system.domain.code.CommonCode;
import com.itsm.system.domain.code.CommonCodeRepository;
import com.itsm.system.dto.organization.customer.CustomerCompanyDTO;
import com.itsm.system.dto.organization.customer.CustomerTeamDTO;
import com.itsm.system.dto.organization.customer.CustomerUserDTO;
import com.itsm.system.repository.organization.customer.CustomerCompanyRepository;
import com.itsm.system.repository.organization.customer.CustomerTeamRepository;
import com.itsm.system.repository.organization.customer.CustomerUserRepository;
import com.itsm.system.service.organization.customer.CustomerService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class CustomerManagementIntegrationTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private CustomerCompanyRepository companyRepository;

    @Autowired
    private CustomerTeamRepository teamRepository;

    @Autowired
    private CustomerUserRepository userRepository;

    @Autowired
    private CodeGroupRepository groupRepository;

    @Autowired
    private CommonCodeRepository commonCodeRepository;

    private Long savedCompanyId;

    @BeforeEach
    void setUp() {
        // Setup Role Code for Validation
        if (!groupRepository.existsById("CUS_ROLE")) {
            groupRepository.save(CodeGroup.builder()
                    .groupId("CUS_ROLE")
                    .name("고객사권한")
                    .isSystem(true)
                    .build());
        }
        
        if (!commonCodeRepository.existsByGroupIdAndCodeId("CUS_ROLE", "ROLE_CUS_ADMIN")) {
            commonCodeRepository.save(CommonCode.builder()
                    .groupId("CUS_ROLE")
                    .codeId("ROLE_CUS_ADMIN")
                    .codeName("고객사관리자")
                    .build());
        }

        CustomerCompanyDTO company = customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId("TEST-C01")
                .name("테스트고객사")
                .build());
        savedCompanyId = company.getId();
    }

    @Test
    @DisplayName("고객사-팀-사용자 계층 구조 생성 및 조회 통합 테스트")
    void customerHierarchy_Lifecycle_Success() {
        // 1. Create Team
        CustomerTeamDTO team = customerService.createTeam(savedCompanyId, CustomerTeamDTO.builder()
                .name("기획팀")
                .build());
        assertThat(team.getId()).isNotNull();

        // 2. Create User
        CustomerUserDTO user = customerService.createUser(team.getId(), CustomerUserDTO.builder()
                .userId("testuser")
                .name("홍길동")
                .password("secret123")
                .role("ROLE_CUS_ADMIN")
                .build());
        assertThat(user.getId()).isNotNull();
        assertThat(user.getCustomerTeamName()).isEqualTo("기획팀");

        // 3. Query Users by Team
        List<CustomerUserDTO> users = customerService.getUsersByTeam(team.getId());
        assertThat(users).hasSize(1);
        assertThat(users.get(0).getUserId()).isEqualTo("testuser");

        // 4. Delete Hierarchy
        customerService.deleteUser(user.getId());
        customerService.deleteTeam(team.getId());
        customerService.deleteCompany(savedCompanyId);

        assertThat(companyRepository.findById(savedCompanyId)).isEmpty();
    }

    @Test
    @DisplayName("잘못된 역할 코드로 사용자 생성 시도 시 예외 발생 검증")
    void createUser_InvalidRole_ThrowsException() {
        CustomerTeamDTO team = customerService.createTeam(savedCompanyId, CustomerTeamDTO.builder().name("팀").build());
        
        CustomerUserDTO userDto = CustomerUserDTO.builder()
                .userId("badrole")
                .password("pass")
                .role("INVALID_ROLE")
                .build();

        assertThatThrownBy(() -> customerService.createUser(team.getId(), userDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Invalid role code");
    }

    @Test
    @DisplayName("중복 사용자 ID 생성 시도 시 예외 발생 검증")
    void createUser_DuplicateId_ThrowsException() {
        String userId = "dup_" + System.currentTimeMillis();
        CustomerTeamDTO team = customerService.createTeam(savedCompanyId, CustomerTeamDTO.builder().name("팀").build());
        
        CustomerUserDTO userDto = CustomerUserDTO.builder()
                .userId(userId)
                .password("pass")
                .role("ROLE_CUS_ADMIN")
                .build();
        
        customerService.createUser(team.getId(), userDto);
        userRepository.flush();

        assertThatThrownBy(() -> customerService.createUser(team.getId(), userDto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User ID already exists");
    }
}

package com.itsm.system.integration.organization;

import com.itsm.system.domain.code.CodeGroup;
import com.itsm.system.domain.code.CodeGroupRepository;
import com.itsm.system.domain.code.CommonCode;
import com.itsm.system.domain.code.CommonCodeRepository;
import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.repository.organization.operator.OperatorCompanyRepository;
import com.itsm.system.repository.organization.operator.OperatorTeamRepository;
import com.itsm.system.repository.organization.operator.OperatorRepository;
import com.itsm.system.service.organization.operator.OperatorService;
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
class OperatorManagementIntegrationTest {

    @Autowired
    private OperatorService operatorService;

    @Autowired
    private OperatorCompanyRepository companyRepository;

    @Autowired
    private OperatorTeamRepository teamRepository;

    @Autowired
    private OperatorRepository operatorRepository;

    @Autowired
    private CodeGroupRepository groupRepository;

    @Autowired
    private CommonCodeRepository commonCodeRepository;

    private Long savedCompanyId;

    @BeforeEach
    void setUp() {
        // Setup Role Code for Validation
        if (!groupRepository.existsById("OPE_ROLE")) {
            groupRepository.save(CodeGroup.builder()
                    .groupId("OPE_ROLE")
                    .name("운영사권한")
                    .isSystem(true)
                    .build());
        }
        
        if (!commonCodeRepository.existsByGroupIdAndCodeId("OPE_ROLE", "ROLE_OPER")) {
            commonCodeRepository.save(CommonCode.builder()
                    .groupId("OPE_ROLE")
                    .codeId("ROLE_OPER")
                    .codeName("운영자")
                    .build());
        }

        OperatorCompanyDTO company = operatorService.createCompany(OperatorCompanyDTO.builder()
                .operatorCompanyId("TEST-OP-" + System.currentTimeMillis())
                .name("테스트운영사")
                .build());
        savedCompanyId = company.getId();
    }

    @Test
    @DisplayName("운영사-팀-운영자 계층 구조 생성 및 조회 통합 테스트")
    void operatorHierarchy_Lifecycle_Success() {
        // 1. Create Team
        OperatorTeamDTO team = operatorService.createTeam(savedCompanyId, OperatorTeamDTO.builder()
                .name("관제팀")
                .build());
        assertThat(team.getId()).isNotNull();

        // 2. Create Operator
        OperatorDTO operator = operatorService.createOperator(team.getId(), OperatorDTO.builder()
                .userId("testoper_" + System.currentTimeMillis())
                .name("이순신")
                .password("oper123")
                .role("ROLE_OPER")
                .build());
        assertThat(operator.getId()).isNotNull();

        // 3. Query All Teams for Company
        List<OperatorTeamDTO> teams = operatorService.getTeamsByCompany(savedCompanyId);
        assertThat(teams).hasSize(1);
        assertThat(teams.get(0).getName()).isEqualTo("관제팀");

        // 4. Query Operators by Team
        List<OperatorDTO> operators = operatorService.getOperatorsByTeam(team.getId());
        assertThat(operators).hasSize(1);
        assertThat(operators.get(0).getName()).isEqualTo("이순신");

        // 5. Delete Operator
        operatorService.deleteOperator(operator.getId());
        assertThat(operatorRepository.findById(operator.getId())).isEmpty();
    }

    @Test
    @DisplayName("중복 운영자 ID 생성 시도 시 예외 발생 검증")
    void createOperator_DuplicateId_ThrowsException() {
        OperatorTeamDTO team = operatorService.createTeam(savedCompanyId, OperatorTeamDTO.builder().name("팀").build());
        String userId = "dup_oper_" + System.currentTimeMillis();
        
        OperatorDTO dto = OperatorDTO.builder()
                .userId(userId)
                .name("Duplicate Oper")
                .password("pass")
                .role("ROLE_OPER")
                .build();
        
        operatorService.createOperator(team.getId(), dto);
        operatorRepository.flush();

        assertThatThrownBy(() -> operatorService.createOperator(team.getId(), dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User ID already exists");
    }
}

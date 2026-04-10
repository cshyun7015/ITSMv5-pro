package com.itsm.system.integration.operator;

import com.itsm.system.domain.code.CodeGroup;
import com.itsm.system.domain.code.CodeGroupRepository;
import com.itsm.system.domain.code.CommonCode;
import com.itsm.system.domain.code.CommonCodeRepository;
import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.service.operator.OperatorService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class OperatorIntegrationTest {

    @Autowired
    private OperatorService operatorService;

    @Autowired
    private EntityManager entityManager;

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
        
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("운영사-팀-운영자 계층 구조 생성 및 조회 통합 테스트")
    void operatorHierarchy_Lifecycle_Success() {
        // 1. Create Team
        OperatorTeamDTO team = operatorService.createTeam(savedCompanyId, OperatorTeamDTO.builder()
                .name("관제팀")
                .build());
        assertThat(team.getId()).isNotNull();

        entityManager.flush();
        entityManager.clear();

        // 2. Create Operator
        OperatorDTO operator = operatorService.createOperator(team.getId(), OperatorDTO.builder()
                .userId("testoper_" + System.currentTimeMillis())
                .name("이순신")
                .password("oper123")
                .role("ROLE_OPER")
                .build());
        assertThat(operator.getId()).isNotNull();

        entityManager.flush();
        entityManager.clear();

        // 3. Query All Teams for Company
        List<OperatorTeamDTO> teams = operatorService.getTeamsByCompany(savedCompanyId);
        assertThat(teams).hasSize(1);
        assertThat(teams.get(0).getName()).isEqualTo("관제팀");

        // 4. Query Operators by Team
        List<OperatorDTO> operators = operatorService.getOperatorsByTeam(team.getId());
        assertThat(operators).hasSize(1);
        assertThat(operators.get(0).getName()).isEqualTo("이순신");

        // Delete Operator
        operatorService.deleteOperator(operator.getId(), false);

        // Force clearing Hibernate session to ensure Filter is applied on next query
        entityManager.flush();
        entityManager.clear();

        // Verify invisibility from a non-MSP context via Service (triggers AOP Filter)
        com.itsm.system.security.TenantContext.setTenantId("T-TEMP");
        try {
            assertThatThrownBy(() -> operatorService.getOperator(operator.getId()))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        } finally {
            com.itsm.system.security.TenantContext.clear();
        }
    }

    @Test
    @DisplayName("MSP 운영자의 물리적 삭제(Hard Delete) 기능 검증")
    void operator_HardDelete_PhysicalRemoval_Success() {
        // 1. Create MSP Company
        OperatorCompanyDTO mspCompany = operatorService.createCompany(OperatorCompanyDTO.builder()
                .operatorCompanyId("MSP") // Criteria: Company ID must be 'MSP'
                .name("MSP Organization")
                .build());

        // 2. Create Team for MSP
        OperatorTeamDTO team = operatorService.createTeam(mspCompany.getId(), OperatorTeamDTO.builder()
                .name("MSP Support Team")
                .build());

        // 3. Create MSP Operator
        OperatorDTO operator = operatorService.createOperator(team.getId(), OperatorDTO.builder()
                .userId("msp_admin_" + System.currentTimeMillis())
                .name("MSP 관리자")
                .password("msp123")
                .role("ROLE_OPER")
                .build());

        entityManager.flush();
        entityManager.clear();

        // 4. Perform Hard Delete (Allowed because caller is MSP (default) and target is MSP)
        operatorService.deleteOperator(operator.getId(), true);

        // 5. Verify physical removal using Native Query (Wait, repo.findById filtered by @SQLRestriction won't tell if it's hard deleted)
        // Check if the record exists in the table even with is_deleted=1 (Native query)
        Long count = (Long) entityManager.createNativeQuery("SELECT count(*) FROM operators WHERE id = :id")
                .setParameter("id", operator.getId())
                .getSingleResult();
        
        assertThat(count).isEqualTo(0L); // Should be 0 if physically deleted
    }

    @Test
    @DisplayName("일반 운영자의 물리적 삭제 시도 시 논리 삭제로 처리되는지 검증")
    void operator_HardDelete_NonMspTarget_ShouldPerformSoftDelete() {
        // 1. NON-MSP Company
        OperatorCompanyDTO company = operatorService.createCompany(OperatorCompanyDTO.builder()
                .operatorCompanyId("GUEST-COMP-" + System.currentTimeMillis())
                .name("일반운영사")
                .build());

        OperatorTeamDTO team = operatorService.createTeam(company.getId(), OperatorTeamDTO.builder().name("일반팀").build());
        
        OperatorDTO operator = operatorService.createOperator(team.getId(), OperatorDTO.builder()
                .userId("guest_oper_" + System.currentTimeMillis())
                .name("방문자")
                .password("guest123")
                .role("ROLE_OPER")
                .build());

        entityManager.flush();
        entityManager.clear();

        // 2. Attempt Hard Delete on non-MSP target (yields soft delete)
        operatorService.deleteOperator(operator.getId(), true);

        // Force clearing Hibernate session to ensure Filter is applied on next query
        entityManager.flush();
        entityManager.clear();

        // Verify it is actually a Soft Delete
        Long count = (Long) entityManager.createNativeQuery("SELECT count(*) FROM operators WHERE id = :id")
                .setParameter("id", operator.getId())
                .getSingleResult();
        
        assertThat(count).isEqualTo(1L); // Not physically removed
        
        // Verify invisibility from a non-MSP context via Service (where deletedFilter is active)
        com.itsm.system.security.TenantContext.setTenantId("T-TEMP");
        try {
            assertThatThrownBy(() -> operatorService.getOperator(operator.getId()))
                    .isInstanceOf(RuntimeException.class)
                    .hasMessageContaining("not found");
        } finally {
            com.itsm.system.security.TenantContext.clear();
        }
    }

    @Test
    @DisplayName("중복 운영사 ID 생성 시도 시 예외 발생 검증")
    void createCompany_DuplicateId_ThrowsException() {
        String companyId = "DUP-COMP-" + System.currentTimeMillis();
        operatorService.createCompany(OperatorCompanyDTO.builder()
                .operatorCompanyId(companyId)
                .name("First Comp")
                .build());

        assertThatThrownBy(() -> operatorService.createCompany(OperatorCompanyDTO.builder()
                .operatorCompanyId(companyId)
                .name("Second Comp")
                .build()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
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

        assertThatThrownBy(() -> operatorService.createOperator(team.getId(), dto))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("User ID already exists");
    }
}

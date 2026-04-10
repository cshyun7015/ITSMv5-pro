package com.itsm.system.integration.customer;

import com.itsm.system.security.TenantContext;
import com.itsm.system.dto.customer.CustomerCompanyDTO;
import com.itsm.system.dto.customer.CustomerTeamDTO;
import com.itsm.system.dto.customer.CustomerUserDTO;
import com.itsm.system.service.customer.CustomerService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
class CustomerIntegrationTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private EntityManager entityManager;

    private Long savedCompanyId;

    @BeforeEach
    void setUp() {
        // Set Tenant Context for Multi-tenancy
        TenantContext.setTenantId("T001");

        CustomerCompanyDTO company = customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId("TEST-C01-" + System.currentTimeMillis())
                .name("테스트고객사")
                .status("ACTIVE")
                .build());
        savedCompanyId = company.getId();
        
        entityManager.flush();
        entityManager.clear();
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("고객사 계층 구조 및 ITIL 메타데이터 통합 검증")
    void organizationHierarchy_And_Metadata_Verification() {
        // 1. Create Parent Team
        CustomerTeamDTO parentTeam = customerService.createTeam(savedCompanyId, CustomerTeamDTO.builder()
                .name("IT본부")
                .costCenter("CC-001")
                .build());
        assertThat(parentTeam.getId()).isNotNull();

        // 2. Create Child Team (Hierarchy)
        CustomerTeamDTO childTeam = customerService.createTeam(savedCompanyId, CustomerTeamDTO.builder()
                .name("보안팀")
                .parentTeamId(parentTeam.getId())
                .costCenter("CC-002")
                .build());
        
        entityManager.flush();
        entityManager.clear();
        
        // 3. Verify Mapping
        CustomerTeamDTO savedChild = customerService.getTeam(childTeam.getId());
        assertThat(savedChild.getParentTeamId()).isEqualTo(parentTeam.getId());

        // 4. Create VIP User (ITIL Metadata)
        CustomerUserDTO vipUser = customerService.createUser(childTeam.getId(), CustomerUserDTO.builder()
                .userId("vip_user_" + System.currentTimeMillis())
                .name("김보안")
                .password("pass123")
                .isVip(true)
                .isApprover(true)
                .userCriticality("HIGH")
                .build());
        
        assertThat(vipUser.getIsVip()).isTrue();
        assertThat(vipUser.getIsApprover()).isTrue();

        // 5. Tree View Verification
        List<CustomerTeamDTO> tree = customerService.getOrganizationTree(savedCompanyId);
        assertThat(tree).isNotEmpty();
        assertThat(tree.stream().anyMatch(t -> t.getName().equals("IT본부"))).isTrue();

        // 6. Audit Verification
        assertThat(vipUser.getCreatedAt()).isNotNull();
    }

    @Test
    @DisplayName("소프트 딜리트 및 테넌트 격리 기능 검증")
    void softDelete_And_TenantIsolation_Verification() {
        // 1. Create Data in Tenant T001
        CustomerTeamDTO team = customerService.createTeam(savedCompanyId, CustomerTeamDTO.builder()
                .name("삭제대상팀")
                .build());
        Long teamId = team.getId();
        
        entityManager.flush();
        entityManager.clear();

        // 2. Delete Team (Soft Delete)
        customerService.deleteTeam(teamId, false);
        
        entityManager.flush();
        entityManager.clear();

        // 3. Verify it's not found via Service query (Filter Applied)
        // Hibernate Filters do NOT apply to findById (direct identifier fetch) by default.
        // We use a list-based query to verify the filter logic.
        List<CustomerTeamDTO> remainingTeams = customerService.getTeamsByCompany(savedCompanyId);
        assertThat(remainingTeams.stream().noneMatch(t -> t.getId().equals(teamId))).isTrue();

        // 4. Verify Multi-tenancy Isolation
        TenantContext.setTenantId("T002"); // Switch to another tenant
        customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId("T002-C01-" + System.currentTimeMillis())
                .name("다른테넌트고객사")
                .build());
        
        entityManager.flush();
        entityManager.clear();
        
        // Tenant T002 should not see Tenant T001's company
        List<CustomerCompanyDTO> allCompanies = customerService.getAllCompanies();
        assertThat(allCompanies).hasSize(1);
        assertThat(allCompanies.get(0).getCustomerId()).startsWith("T002-C01");
    }
}

package com.itsm.system.integration.operator.mapping;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.operator.OperatorCompany;
import com.itsm.system.domain.organization.operator.OperatorTeam;
import com.itsm.system.dto.organization.mapping.TeamCustomerMapDTO;
import com.itsm.system.repository.customer.CustomerCompanyRepository;
import com.itsm.system.repository.operator.OperatorCompanyRepository;
import com.itsm.system.repository.operator.OperatorTeamRepository;
import com.itsm.system.service.operator.mapping.TeamCustomerMapService;
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
class TeamCustomerMapIntegrationTest {

    @Autowired
    private TeamCustomerMapService mappingService;

    @Autowired
    private OperatorCompanyRepository companyRepository;

    @Autowired
    private OperatorTeamRepository teamRepository;

    @Autowired
    private CustomerCompanyRepository customerRepository;

    @Autowired
    private EntityManager entityManager;

    private OperatorTeam savedTeam;
    private CustomerCompany savedCustomer;

    @BeforeEach
    void setUp() {
        OperatorCompany company = companyRepository.save(OperatorCompany.builder()
                .operatorCompanyId("OP-001")
                .name("운영사A")
                .status("ACTIVE")
                .build());

        savedTeam = teamRepository.save(OperatorTeam.builder()
                .name("운영팀A")
                .operatorCompany(company)
                .build());

        savedCustomer = customerRepository.save(CustomerCompany.builder()
                .customerId("CUST-001")
                .name("고객사A")
                .status("ACTIVE")
                .build());
        
        entityManager.flush();
        entityManager.clear();
    }

    @Test
    @DisplayName("팀-고객사 매핑 생성 및 조회 통합 테스트")
    void teamCustomerMapping_Lifecycle_Success() {
        // 1. Assign
        TeamCustomerMapDTO mapped = mappingService.assignTeamToCustomer(savedTeam.getId(), savedCustomer.getId());
        assertThat(mapped.getOperatorTeamId()).isEqualTo(savedTeam.getId());
        assertThat(mapped.getCustomerCompanyId()).isEqualTo(savedCustomer.getId());

        // 2. Query by Team
        List<TeamCustomerMapDTO> byTeam = mappingService.getMappingsByTeam(savedTeam.getId());
        assertThat(byTeam).hasSize(1);
        assertThat(byTeam.get(0).getCustomerCompanyName()).isEqualTo("고객사A");

        // 3. Query by Customer
        List<TeamCustomerMapDTO> byCustomer = mappingService.getMappingsByCustomer(savedCustomer.getId());
        assertThat(byCustomer).hasSize(1);
        assertThat(byCustomer.get(0).getOperatorTeamName()).isEqualTo("운영팀A");

        // 4. Unassign
        mappingService.unassignTeamFromCustomer(savedTeam.getId(), savedCustomer.getId());
        assertThat(mappingService.getMappingsByTeam(savedTeam.getId())).isEmpty();
    }

    @Test
    @DisplayName("존재하지 않는 팀 할당 시도 시 예외 발생")
    void assign_NonExistentTeam_ThrowsException() {
        assertThatThrownBy(() -> mappingService.assignTeamToCustomer(999L, savedCustomer.getId()))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Operator Team not found");
    }

    @Test
    @DisplayName("존재하지 않는 고객사 할당 시도 시 예외 발생")
    void assign_NonExistentCustomer_ThrowsException() {
        assertThatThrownBy(() -> mappingService.assignTeamToCustomer(savedTeam.getId(), 999L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Customer Company not found");
    }
}

package com.itsm.system.integration.customer;

import com.itsm.system.security.TenantContext;
import com.itsm.system.dto.customer.CustomerCompanyDTO;
import com.itsm.system.service.customer.CustomerService;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.AfterEach;
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
class MspTenantIntegrationTest {

    @Autowired
    private CustomerService customerService;

    @Autowired
    private EntityManager entityManager;

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("MSP는 모든 테넌트의 데이터를 조회할 수 있으며 Soft Delete된 데이터도 볼 수 있다")
    void mspShouldSeeAllTenantsAndDeletedData() {
        // 1. Create data in Tenant A
        TenantContext.setTenantId("T-AAA");
        customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId("C-AAA-" + System.currentTimeMillis())
                .name("Company AAA")
                .build());

        // 2. Create data in Tenant B and Soft Delete it (Manual Soft Delete for testing)
        String bCustomerId = "C-BBB-" + System.currentTimeMillis();
        TenantContext.setTenantId("T-BBB");
        CustomerCompanyDTO companyDTOB = customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId(bCustomerId)
                .name("Company BBB")
                .build());
        
        // Manual Soft Delete simulation
        customerService.updateCompany(companyDTOB.getId(), CustomerCompanyDTO.builder()
                .customerId(bCustomerId)
                .name("Company BBB")
                .isDeleted(true)
                .build());

        entityManager.flush();
        entityManager.clear();

        // 3. Switch to MSP context
        TenantContext.setTenantId(TenantContext.DEFAULT_TENANT); // MSP

        // 4. Verify MSP sees both T-AAA and T-BBB(deleted)
        List<CustomerCompanyDTO> allCompanies = customerService.getAllCompanies();
        
        assertThat(allCompanies).hasSizeGreaterThanOrEqualTo(2);
        assertThat(allCompanies.stream().anyMatch(c -> c.getName().equals("Company AAA"))).isTrue();
        assertThat(allCompanies.stream().anyMatch(c -> c.getCustomerId().equals(bCustomerId))).isTrue();
        
        // 5. Switch back to T-AAA and verify they cannot see T-BBB or deleted ones
        TenantContext.setTenantId("T-AAA");
        List<CustomerCompanyDTO> aaaCompanies = customerService.getAllCompanies();
        assertThat(aaaCompanies.stream().noneMatch(c -> c.getCustomerId().equals(bCustomerId))).isTrue();
    }

    @Test
    @DisplayName("MSP는 신규 데이터 생성 시 명시적으로 테넌트를 지정할 수 있다")
    void mspCanExplicitlySpecifyTenantId() {
        // 1. Set MSP context
        TenantContext.setTenantId(TenantContext.DEFAULT_TENANT);

        // 2. Create company for Tenant C
        String cCustomerId = "C-CCC-" + System.currentTimeMillis();
        CustomerCompanyDTO newCompany = customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId(cCustomerId)
                .name("Company CCC")
                .tenantId("T-CCC") // Explicitly setting tenantId
                .build());

        entityManager.flush();
        entityManager.clear();

        // 3. Switch context to Tenant C
        TenantContext.setTenantId("T-CCC");

        // 4. Verify Tenant C can see its company
        List<CustomerCompanyDTO> cccCompanies = customerService.getAllCompanies();
        assertThat(cccCompanies.stream().anyMatch(c -> c.getId().equals(newCompany.getId()))).isTrue();
        
        // Find specifically by ID to check tenantId in DTO
        CustomerCompanyDTO fetched = customerService.getCompany(newCompany.getId());
        assertThat(fetched.getTenantId()).isEqualTo("T-CCC");
    }

    @Test
    @DisplayName("MSP는 데이터를 물리적으로 삭제(Hard Delete)할 수 있다")
    void mspCanPerformHardDelete() {
        // 1. Set MSP context
        TenantContext.setTenantId(TenantContext.DEFAULT_TENANT);

        // 2. Create target company
        CustomerCompanyDTO company = customerService.createCompany(CustomerCompanyDTO.builder()
                .customerId("C-HARD-" + System.currentTimeMillis())
                .name("Hard Delete Target")
                .build());
        Long id = company.getId();

        entityManager.flush();
        entityManager.clear();

        // 3. Perform Hard Delete (id, hardDelete=true)
        customerService.deleteCompany(id, true);

        entityManager.flush();
        entityManager.clear();

        // 4. Verify it's physically gone (even MSP cannot see it)
        List<CustomerCompanyDTO> allCompanies = customerService.getAllCompanies();
        assertThat(allCompanies.stream().noneMatch(c -> c.getId().equals(id))).isTrue();
    }
}

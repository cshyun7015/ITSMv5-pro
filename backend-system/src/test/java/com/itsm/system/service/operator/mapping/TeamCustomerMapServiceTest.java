package com.itsm.system.service.operator.mapping;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.mapping.TeamCustomerMap;
import com.itsm.system.domain.organization.operator.OperatorTeam;
import com.itsm.system.dto.organization.mapping.TeamCustomerMapDTO;
import com.itsm.system.repository.customer.CustomerCompanyRepository;
import com.itsm.system.repository.operator.OperatorTeamRepository;
import com.itsm.system.repository.operator.mapping.TeamCustomerMapRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeamCustomerMapServiceTest {

    @Mock
    private TeamCustomerMapRepository repository;
    @Mock
    private OperatorTeamRepository teamRepository;
    @Mock
    private CustomerCompanyRepository customerRepository;

    @InjectMocks
    private TeamCustomerMapService mappingService;

    @Test
    @DisplayName("이미 존재하는 매핑을 할당 시도하면 기존 매핑을 반환한다")
    void assignTeamToCustomer_AlreadyExists_ReturnsExisting() {
        // given
        Long teamId = 1L;
        Long customerId = 100L;
        TeamCustomerMap.TeamCustomerMapId id = new TeamCustomerMap.TeamCustomerMapId(teamId, customerId);
        
        OperatorTeam team = OperatorTeam.builder().id(teamId).name("Team A").build();
        CustomerCompany customer = CustomerCompany.builder().id(customerId).name("Customer X").build();
        TeamCustomerMap existingMap = TeamCustomerMap.builder()
                .id(id)
                .operatorTeam(team)
                .customerCompany(customer)
                .build();

        when(repository.existsById(id)).thenReturn(true);
        when(repository.getReferenceById(id)).thenReturn(existingMap);

        // when
        TeamCustomerMapDTO result = mappingService.assignTeamToCustomer(teamId, customerId);

        // then
        assertThat(result.getOperatorTeamId()).isEqualTo(teamId);
        assertThat(result.getCustomerCompanyId()).isEqualTo(customerId);
        verify(repository, never()).save(any());
    }

    @Test
    @DisplayName("새로운 매핑을 할당하면 저장 후 DTO를 반환한다")
    void assignTeamToCustomer_NewMapping_SavesAndReturns() {
        // given
        Long teamId = 1L;
        Long customerId = 100L;
        TeamCustomerMap.TeamCustomerMapId id = new TeamCustomerMap.TeamCustomerMapId(teamId, customerId);
        
        OperatorTeam team = OperatorTeam.builder().id(teamId).name("Team A").build();
        CustomerCompany customer = CustomerCompany.builder().id(customerId).name("Customer X").build();

        when(repository.existsById(id)).thenReturn(false);
        when(teamRepository.findById(teamId)).thenReturn(Optional.of(team));
        when(customerRepository.findById(customerId)).thenReturn(Optional.of(customer));
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        // when
        TeamCustomerMapDTO result = mappingService.assignTeamToCustomer(teamId, customerId);

        // then
        assertThat(result.getOperatorTeamId()).isEqualTo(teamId);
        assertThat(result.getCustomerCompanyId()).isEqualTo(customerId);
        verify(repository).save(any());
    }
}

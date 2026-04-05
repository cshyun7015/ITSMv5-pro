package com.itsm.incident.service;

import com.itsm.incident.domain.Incident;
import com.itsm.incident.domain.types.IncidentImpact;
import com.itsm.incident.domain.types.IncidentStatus;
import com.itsm.incident.domain.types.IncidentUrgency;
import com.itsm.incident.dto.IncidentDTO;
import com.itsm.incident.repository.IncidentHistoryRepository;
import com.itsm.incident.repository.IncidentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentServiceTest {

    @Mock
    private IncidentRepository repository;

    @Mock
    private IncidentHistoryRepository historyRepository;

    @InjectMocks
    private IncidentService incidentService;

    private Incident sampleIncident;
    private IncidentDTO sampleDTO;

    @BeforeEach
    void setUp() {
        sampleDTO = IncidentDTO.builder()
                .title("Network Failure")
                .description("Cannot access the main server.")
                .tenantId("SYSTEM")
                .impact(IncidentImpact.HIGH)
                .urgency(IncidentUrgency.HIGH)
                .build();

        sampleIncident = Incident.builder()
                .id(1L)
                .incidentId("INC-20260405-TEST")
                .title("Network Failure")
                .description("Cannot access the main server.")
                .status(IncidentStatus.NEW)
                .tenantId("SYSTEM")
                .build();
    }

    @Test
    @DisplayName("인시던트 생성 테스트 - 상태는 NEW여야 함")
    void createIncident_ShouldReturnNewIncident() {
        // given
        when(repository.save(any(Incident.class))).thenReturn(sampleIncident);

        // when
        IncidentDTO created = incidentService.create(sampleDTO);

        // then
        assertThat(created.getStatus()).isEqualTo(IncidentStatus.NEW);
        assertThat(created.getTitle()).isEqualTo("Network Failure");
        verify(repository, times(1)).save(any(Incident.class));
        verify(historyRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("상태 전이 테스트: NEW -> ASSIGNED -> IN_PROGRESS -> RESOLVED -> CLOSED")
    void statusTransition_FullLifecycle() {
        // 1. Initial State: NEW
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncident));
        when(repository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // 2. NEW -> ASSIGNED
        IncidentDTO update1 = IncidentDTO.builder().status(IncidentStatus.ASSIGNED).assigneeId("USER-001").build();
        IncidentDTO res1 = incidentService.update(1L, update1, "SYSTEM");
        assertThat(res1.getStatus()).isEqualTo(IncidentStatus.ASSIGNED);

        // 3. ASSIGNED -> IN_PROGRESS
        sampleIncident.setStatus(IncidentStatus.ASSIGNED); // Update mock state
        IncidentDTO update2 = IncidentDTO.builder().status(IncidentStatus.IN_PROGRESS).build();
        IncidentDTO res2 = incidentService.update(1L, update2, "SYSTEM");
        assertThat(res2.getStatus()).isEqualTo(IncidentStatus.IN_PROGRESS);

        // 4. IN_PROGRESS -> RESOLVED
        sampleIncident.setStatus(IncidentStatus.IN_PROGRESS);
        IncidentDTO update3 = IncidentDTO.builder()
                .status(IncidentStatus.RESOLVED)
                .resolutionCode("FIXED")
                .workaround("Static IP applied")
                .build();
        IncidentDTO res3 = incidentService.update(1L, update3, "SYSTEM");
        assertThat(res3.getStatus()).isEqualTo(IncidentStatus.RESOLVED);

        // 5. RESOLVED -> CLOSED
        sampleIncident.setStatus(IncidentStatus.RESOLVED);
        IncidentDTO update4 = IncidentDTO.builder().status(IncidentStatus.CLOSED).build();
        IncidentDTO res4 = incidentService.update(1L, update4, "SYSTEM");
        assertThat(res4.getStatus()).isEqualTo(IncidentStatus.CLOSED);
    }

    @Test
    @DisplayName("보류 상태 테스트: IN_PROGRESS -> ON_HOLD -> IN_PROGRESS")
    void statusTransition_OnHold() {
        sampleIncident.setStatus(IncidentStatus.IN_PROGRESS);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncident));
        when(repository.save(any(Incident.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // IN_PROGRESS -> ON_HOLD
        IncidentDTO holdUpdate = IncidentDTO.builder()
                .status(IncidentStatus.ON_HOLD)
                .onHoldReason("Awaiting Customer Feedback")
                .build();
        IncidentDTO held = incidentService.update(1L, holdUpdate, "SYSTEM");
        assertThat(held.getStatus()).isEqualTo(IncidentStatus.ON_HOLD);
        assertThat(held.getOnHoldReason()).isEqualTo("Awaiting Customer Feedback");

        // ON_HOLD -> IN_PROGRESS
        sampleIncident.setStatus(IncidentStatus.ON_HOLD);
        IncidentDTO resumeUpdate = IncidentDTO.builder().status(IncidentStatus.IN_PROGRESS).build();
        IncidentDTO resumed = incidentService.update(1L, resumeUpdate, "SYSTEM");
        assertThat(resumed.getStatus()).isEqualTo(IncidentStatus.IN_PROGRESS);
    }

    @Test
    @DisplayName("잘못된 상태 전이 예외 테스트: NEW -> RESOLVED (직접 전이 불가)")
    void invalidStatusTransition_ThrowsException() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncident));

        IncidentDTO invalidUpdate = IncidentDTO.builder().status(IncidentStatus.RESOLVED).build();

        assertThatThrownBy(() -> incidentService.update(1L, invalidUpdate, "SYSTEM"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Invalid status transition");
    }

    @Test
    @DisplayName("CLOSED 상태의 인시던트는 수정할 수 없어야 함")
    void updateClosedIncident_ThrowsException() {
        sampleIncident.setStatus(IncidentStatus.CLOSED);
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncident));

        IncidentDTO infoUpdate = IncidentDTO.builder().title("New Title").build();

        assertThatThrownBy(() -> incidentService.update(1L, infoUpdate, "SYSTEM"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Cannot update a CLOSED incident");
    }

    @Test
    @DisplayName("인시던트 조회 테스트")
    void getIncidentById_ShouldReturnDto() {
        when(repository.findById(1L)).thenReturn(Optional.of(sampleIncident));

        IncidentDTO found = incidentService.getById(1L);

        assertThat(found.getIncidentId()).isEqualTo("INC-20260405-TEST");
        verify(repository, times(1)).findById(1L);
    }
}

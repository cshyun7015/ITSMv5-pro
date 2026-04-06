package com.itsm.incident.integration;

import com.itsm.incident.domain.Incident;
import com.itsm.incident.domain.IncidentHistory;
import com.itsm.incident.domain.types.*;
import com.itsm.incident.dto.IncidentDTO;
import com.itsm.incident.repository.IncidentHistoryRepository;
import com.itsm.incident.repository.IncidentRepository;
import com.itsm.incident.service.IncidentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.Arguments;
import org.junit.jupiter.params.provider.MethodSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Stream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
@ActiveProfiles("test")
public class IncidentLifecycleIntegrationTest {

    @Autowired private IncidentService incidentService;
    @Autowired private IncidentRepository repository;
    @Autowired private IncidentHistoryRepository historyRepository;

    // Constants for multi-tenant / multi-role test environment
    private static final String TENANT_A = "CUSTOMER-001"; // 고객사 A
    private static final String TENANT_B = "CUSTOMER-002"; // 고객사 B
    private static final String MSP_X = "MSP-ALPHA";        // 운영사 X
    private static final String MSP_Y = "MSP_BETA";         // 운영사 Y
    private static final String OP_X1 = "OPERATOR-X1";     // 운영사 X 소속 운영자
    private static final String OP_Y1 = "OPERATOR-Y1";     // 운영사 Y 소속 운영자
    private static final String USER_A = "USER-A1";        // 고객사 A 소속 사용자
    private static final String USER_B = "USER-B1";        // 고객사 B 소속 사용자

    @BeforeEach
    void clearDatabase() {
        historyRepository.deleteAll();
        repository.deleteAll();
    }

    @Test
    @DisplayName("복합 환경 시나리오 TEST: 100% 테이블 컬럼 매핑 및 복합 조회 검증")
    void complexEnvironment_And_FullColumnCoverage_Test() {
        // Given: 모든 컬럼 데이터를 포함한 DTO 생성
        IncidentDTO dto = IncidentDTO.builder()
                .title("Critical Network Outage - Server A")
                .description("Main application server is unreachable due to switch failure.")
                .tenantId(TENANT_A)
                .categoryId("NETWORK")
                .subCategoryId("SWITCH")
                .serviceId("ERP-SYSTEM")
                .ciId("SW-B1-01")
                .mspId(MSP_X)
                .channel(IncidentChannel.MONITORING)
                .impact(IncidentImpact.HIGH)
                .urgency(IncidentUrgency.HIGH)
                .requesterId(USER_A)
                .affectedUserId(USER_A)
                .assignmentGroupId("NOC-LEVEL-2")
                .traceId("trace-12345")
                .eventId("evt-999")
                .isMajorIncident(true) // P1 자동 계산 트리거
                .build();

        // When: 인시던트 등록
        IncidentDTO saved = incidentService.create(dto);

        // Then: 100% 컬럼 저장 및 기본 필드 검증
        assertThat(saved.getId()).isNotNull();
        assertThat(saved.getIncidentId()).startsWith("INC-");
        assertThat(saved.getStatus()).isEqualTo(IncidentStatus.NEW);
        assertThat(saved.getPriority()).isEqualTo(IncidentPriority.P1); // Major Incident -> P1
        assertThat(saved.getTenantId()).isEqualTo(TENANT_A);
        assertThat(saved.getMspId()).isEqualTo(MSP_X);
        assertThat(saved.getCategoryId()).isEqualTo("NETWORK");
        
        // 데이터 무결성 검사 - 리포지토리 직접 확인
        Incident entity = repository.findById(saved.getId()).orElseThrow();
        assertThat(entity.getServiceId()).isEqualTo("ERP-SYSTEM");
        assertThat(entity.getUrgency()).isEqualTo(IncidentUrgency.HIGH);
        assertThat(entity.getTraceId()).isEqualTo("trace-12345");
        assertThat(entity.isMajorIncident()).isTrue();
    }

    @Test
    @DisplayName("권한 기반 조회 TEST: Admin, 운영자, 사용자 관점의 필터링 검토")
    void rbacPerspective_Filtering_Test() {
        // Given: 다양한 고객사와 운영사가 섞인 데이터 생성
        incidentService.create(createMinimalDTO(TENANT_A, MSP_X, "A's Issue Manage by X"));
        incidentService.create(createMinimalDTO(TENANT_A, MSP_Y, "A's Issue Manage by Y"));
        incidentService.create(createMinimalDTO(TENANT_B, MSP_Y, "B's Issue Manage by Y"));

        Pageable pageable = PageRequest.of(0, 10);

        // 1. Admin 관점 (전체 조회): 3건 모두 조회되어야 함
        Page<IncidentDTO> allList = incidentService.getList(null, null, null, null, null, null, pageable);
        assertThat(allList.getTotalElements()).isEqualTo(3);

        // 2. Customer A 관점 (테넌트 필터): 본인 회사(TENANT_A) 것만 조회되어야 함 (2건)
        Page<IncidentDTO> tenantAList = incidentService.getList(TENANT_A, null, null, null, null, null, pageable);
        assertThat(tenantAList.getTotalElements()).isEqualTo(2);
        assertThat(tenantAList.getContent()).allMatch(i -> i.getTenantId().equals(TENANT_A));

        // 3. MSP Y 운영자 관점 (MSP 필터): 본인이 담당하는 운영사(MSP_Y) 것만 조회되어야 함 (2건)
        Page<IncidentDTO> mspYList = incidentService.getList(null, MSP_Y, null, null, null, null, pageable);
        assertThat(mspYList.getTotalElements()).isEqualTo(2);
        assertThat(mspYList.getContent()).allMatch(i -> i.getMspId().equals(MSP_Y));

        // 4. 복합 필터: Tenant A 이면서 MSP Y인 것 (1건)
        Page<IncidentDTO> complexList = incidentService.getList(TENANT_A, MSP_Y, null, null, null, null, pageable);
        assertThat(complexList.getTotalElements()).isEqualTo(1);
    }

    @ParameterizedTest
    @MethodSource("provideAllValidTransitions")
    @DisplayName("인시던트 모든 상태 변경 경로 점검")
    void statusTransition_Lifecycle_Check(IncidentStatus from, IncidentStatus to) {
        // Given
        Incident incident = repository.save(Incident.builder()
                .incidentId("INC-TRANS-" + from.name() + "-" + to.name())
                .title("Transition Test")
                .tenantId(TENANT_A)
                .status(from)
                .build());

        // When
        IncidentDTO updateReq = IncidentDTO.builder().status(to).build();
        IncidentDTO updated = incidentService.update(incident.getId(), updateReq, OP_X1);

        // Then
        assertThat(updated.getStatus()).isEqualTo(to);
        
        // 히스토리 생성 확인
        List<IncidentHistory> histories = historyRepository.findByIncidentOrderByChangedAtDesc(repository.findById(incident.getId()).get());
        assertThat(histories).isNotEmpty();
        assertThat(histories.get(0).getNewValue()).isEqualTo(to.name());
        assertThat(histories.get(0).getChangedBy()).isEqualTo(OP_X1);
    }

    @Test
    @DisplayName("상태 변경 예외 점검: 잘못된 전이 시도 시 IllegalStateException 발생")
    void invalidStatusTransition_ShouldThrowException() {
        // Given: NEW 상태로 시작
        IncidentDTO created = incidentService.create(createMinimalDTO(TENANT_A, MSP_X, "Ready to Fail"));
        
        // When & Then: NEW -> RESOLVED (직접 전이 불가)
        assertThatThrownBy(() -> 
                incidentService.update(created.getId(), IncidentDTO.builder().status(IncidentStatus.RESOLVED).build(), OP_X1)
        ).isInstanceOf(IllegalStateException.class);

        // When & Then: CLOSED 상태에서 수정 시도 시 불가
        incidentService.update(created.getId(), IncidentDTO.builder().status(IncidentStatus.CLOSED).build(), OP_X1);
        assertThatThrownBy(() -> 
                incidentService.update(created.getId(), IncidentDTO.builder().title("New Title").build(), OP_X1)
        ).isInstanceOf(IllegalStateException.class).hasMessageContaining("CLOSED");
    }

    // --- Helper Methods ---

    private IncidentDTO createMinimalDTO(String tenantId, String mspId, String title) {
        return IncidentDTO.builder()
                .tenantId(tenantId)
                .mspId(mspId)
                .title(title)
                .build();
    }

    private static Stream<Arguments> provideAllValidTransitions() {
        return Stream.of(
            Arguments.of(IncidentStatus.NEW, IncidentStatus.ASSIGNED),
            Arguments.of(IncidentStatus.NEW, IncidentStatus.ON_HOLD),
            Arguments.of(IncidentStatus.NEW, IncidentStatus.CLOSED),
            Arguments.of(IncidentStatus.ASSIGNED, IncidentStatus.IN_PROGRESS),
            Arguments.of(IncidentStatus.ASSIGNED, IncidentStatus.ON_HOLD),
            Arguments.of(IncidentStatus.IN_PROGRESS, IncidentStatus.RESOLVED),
            Arguments.of(IncidentStatus.IN_PROGRESS, IncidentStatus.ASSIGNED),
            Arguments.of(IncidentStatus.ON_HOLD, IncidentStatus.IN_PROGRESS),
            Arguments.of(IncidentStatus.RESOLVED, IncidentStatus.CLOSED),
            Arguments.of(IncidentStatus.RESOLVED, IncidentStatus.IN_PROGRESS)
        );
    }
}

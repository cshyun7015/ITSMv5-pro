package com.itsm.event.service;

import com.itsm.event.domain.Event;
import com.itsm.event.domain.EventRepository;
import com.itsm.event.dto.EventDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private EventService eventService;

    private EventDTO baseDto;
    private Event baseEntity;

    @BeforeEach
    void setUp() {
        baseDto = EventDTO.builder()
                .companyId("SAMSUNG")
                .sourceCode("GRAFANA")
                .severityCode("CRITICAL")
                .message("Test Alert Message")
                .node("host-01")
                .fingerprint("test-fingerprint-001")
                .build();

        baseEntity = Event.builder()
                .id(1L)
                .eventNumber("EV-202604-00001")
                .companyId("SAMSUNG")
                .sourceCode("GRAFANA")
                .severityCode("CRITICAL")
                .message("Test Alert Message")
                .node("host-01")
                .fingerprint("test-fingerprint-001")
                .statusCode("NEW")
                .occurrenceCount(1)
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("기본 CRUD: 이벤트 생성 및 중복 카운팅 테스트")
    void createEventTest() {
        // given
        when(eventRepository.countByCreatedAtAfter(any())).thenReturn(0L);
        when(eventRepository.save(any(Event.class))).thenReturn(baseEntity);
        
        // when: 신규 생성
        EventDTO created = eventService.createEvent(baseDto);
        
        // then
        assertThat(created.getEventNumber()).isNotNull();
        assertThat(created.getStatusCode()).isEqualTo("NEW");
        verify(eventRepository, times(1)).save(any(Event.class));

        // given: 중복 데이터 발생 상황 (Fingerprint 동일)
        when(eventRepository.findFirstByFingerprintAndStatusCodeInOrderByCreatedAtDesc(anyString(), anyCollection()))
                .thenReturn(Optional.of(baseEntity));
        
        // when: 재발생 처리
        EventDTO reoccurred = eventService.createEvent(baseDto);
        
        // then
        assertThat(reoccurred.getOccurrenceCount()).isEqualTo(2);
        verify(eventRepository, times(2)).save(any(Event.class));
    }

    @Test
    @DisplayName("기본 CRUD: 이벤트 조회 및 삭제 테스트")
    void getAndDeleteTest() {
        // given
        when(eventRepository.findById(1L)).thenReturn(Optional.of(baseEntity));
        
        // when: 상세 조회
        EventDTO found = eventService.getEvent(1L);
        
        // then
        assertThat(found.getEventNumber()).isEqualTo(baseEntity.getEventNumber());
        
        // when: 삭제
        eventService.deleteEvent(1L);
        
        // then
        verify(eventRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("상태 변화 테스트: 신규 -> 인지함 -> 해결됨")
    void statusTransition_ToResolved_Test() {
        // 1. NEW -> ACKNOWLEDGED (Acknowledge)
        when(eventRepository.findById(1L)).thenReturn(Optional.of(baseEntity));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        EventDTO ackResult = eventService.acknowledgeEvent(1L, "admin-user");
        assertThat(ackResult.getStatusCode()).isEqualTo("ACKNOWLEDGED");
        assertThat(ackResult.getAssigneeId()).isEqualTo("admin-user");

        // 2. ACKNOWLEDGED -> RESOLVED (Update)
        EventDTO updateDto = EventDTO.builder().statusCode("RESOLVED").build();
        EventDTO resolvedResult = eventService.updateEvent(1L, updateDto);
        assertThat(resolvedResult.getStatusCode()).isEqualTo("RESOLVED");
    }

    @Test
    @DisplayName("상태 변화 테스트: 신규 -> 인지함 -> 장애전환")
    void statusTransition_ToPromoted_Test() {
        // 1. NEW (Set up mock entity)
        baseEntity.setStatusCode("NEW");
        when(eventRepository.findById(1L)).thenReturn(Optional.of(baseEntity));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        // 2. Mock external Incident Service call
        Map<String, Object> mockResponse = new HashMap<>();
        mockResponse.put("reqNumber", "INC-202604-999");
        when(restTemplate.postForEntity(anyString(), any(), any())).thenReturn(new ResponseEntity<>(mockResponse, HttpStatus.CREATED));

        // when: Promote
        EventDTO promotedResult = eventService.promoteToIncident(1L);

        // then
        assertThat(promotedResult.getStatusCode()).isEqualTo("PROMOTED");
        assertThat(promotedResult.getRelatedRequestId()).isEqualTo("INC-202604-999");
        verify(restTemplate, times(1)).postForEntity(anyString(), any(), any());
    }

    @Test
    @DisplayName("상태 변화 테스트: 신규 -> 인지함 -> 취소됨")
    void statusTransition_ToCancelled_Test() {
        // given
        when(eventRepository.findById(1L)).thenReturn(Optional.of(baseEntity));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        // when: NEW -> CANCELLED
        EventDTO updateDto = EventDTO.builder().statusCode("CANCELLED").build();
        EventDTO cancelledResult = eventService.updateEvent(1L, updateDto);

        // then
        assertThat(cancelledResult.getStatusCode()).isEqualTo("CANCELLED");
    }
}

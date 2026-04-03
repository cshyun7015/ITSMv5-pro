package com.itsm.dashboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.util.UriComponentsBuilder;
import reactor.core.publisher.Mono;

import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ExternalApiService {

    private final WebClient webClient;

    @Value("${services.system-url}")
    private String systemUrl;

    @Value("${services.request-url}")
    private String requestUrl;

    public Mono<Map<String, Object>> getSystemStats(String companyId, String token) {
        // 1. UriComponentsBuilder 사용 (StringBuilder보다 안전하고 가독성이 좋음)
        String uri = UriComponentsBuilder.fromHttpUrl(systemUrl + "/api/v1/system/stats/summary")
                .queryParamIfPresent("companyId", Optional.ofNullable(companyId).filter(s -> !s.isEmpty()))
                .toUriString();

        return webClient.get()
                .uri(uri)
                .cookie("ITSMSession", token)
                .retrieve()
                // 2. ParameterizedTypeReference를 사용하여 Map<String, Object> 타입 명시
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                // 3. 에러 발생 시 반환할 기본값도 타입에 맞게 설정
                .onErrorReturn(Map.of(
                        "companyCount", 0L,
                        "userCount", 0L
                ));
    }

    public Mono<Map<String, Object>> getRequestStats(String companyId, String fromDate, String toDate, String token) {
        // 1. UriComponentsBuilder로 쿼리 파라미터 조합 (hasOpened 플래그 불필요)
        String uri = UriComponentsBuilder.fromHttpUrl(requestUrl + "/api/v1/request/stats/summary")
                .queryParamIfPresent("companyId", Optional.ofNullable(companyId).filter(s -> !s.isEmpty()))
                .queryParamIfPresent("fromDate", Optional.ofNullable(fromDate).filter(s -> !s.isEmpty()))
                .queryParamIfPresent("toDate", Optional.ofNullable(toDate).filter(s -> !s.isEmpty()))
                .toUriString();

        return webClient.get()
                .uri(uri)
                .cookie("ITSMSession", token)
                .retrieve()
                // 2. Map<String, Object> 타입으로 명확하게 파싱
                .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                // 3. 에러 발생 시 반환할 기본 Map 설정
                .onErrorReturn(Map.of(
                        "totalRequests", 0L,
                        "openRequests", 0L,
                        "inProgressRequests", 0L
                ));
    }
}

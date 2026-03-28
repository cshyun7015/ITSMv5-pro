package com.itsm.dashboard.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ExternalApiService {

    private final WebClient webClient;

    @Value("${services.system-url}")
    private String systemUrl;

    @Value("${services.request-url}")
    private String requestUrl;

    public Mono<Map> getSystemStats(String token) {
        return webClient.get()
                .uri(systemUrl + "/api/v1/system/stats/summary")
                .cookie("ITSMSession", token)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of("companyCount", 0, "userCount", 0));
    }

    public Mono<Map> getRequestStats(String companyId, String token) {
        String uri = requestUrl + "/api/v1/request/stats/summary";
        if (companyId != null && !companyId.isEmpty()) {
            uri += "?companyId=" + companyId;
        }
        
        return webClient.get()
                .uri(uri)
                .cookie("ITSMSession", token)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of("totalRequests", 0, "openRequests", 0, "inProgressRequests", 0));
    }
}

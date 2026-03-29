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

    public Mono<Map> getSystemStats(String companyId, String token) {
        StringBuilder uriBuilder = new StringBuilder(systemUrl + "/api/v1/system/stats/summary");
        if (companyId != null && !companyId.isEmpty()) {
            uriBuilder.append("?companyId=").append(companyId);
        }
        
        return webClient.get()
                .uri(uriBuilder.toString())
                .cookie("ITSMSession", token)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of("companyCount", 0L, "userCount", 0L));
    }

    public Mono<Map> getRequestStats(String companyId, String fromDate, String toDate, String token) {
        StringBuilder uriBuilder = new StringBuilder(requestUrl + "/api/v1/request/stats/summary");
        boolean hasOpened = false;
        
        if (companyId != null && !companyId.isEmpty()) {
            uriBuilder.append("?companyId=").append(companyId);
            hasOpened = true;
        }
        if (fromDate != null && !fromDate.isEmpty()) {
            uriBuilder.append(hasOpened ? "&" : "?").append("fromDate=").append(fromDate);
            hasOpened = true;
        }
        if (toDate != null && !toDate.isEmpty()) {
            uriBuilder.append(hasOpened ? "&" : "?").append("toDate=").append(toDate);
        }
        
        return webClient.get()
                .uri(uriBuilder.toString())
                .cookie("ITSMSession", token)
                .retrieve()
                .bodyToMono(Map.class)
                .onErrorReturn(Map.of("totalRequests", 0L, "openRequests", 0L, "inProgressRequests", 0L));
    }
}

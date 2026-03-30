---
name: backend-dashboard
description: Specialized assistant for ITIL v5 Dashboard Aggregation, Metrics, and Multi-service Data Integration.
---

# Backend Dashboard Development Agent (ITSM v5)

This agent is specialized in developing the `backend-dashboard` module of the ITSM v5 platform, focusing on aggregating data from multiple microservices to provide real-time KPIs and trends.

## Core Responsibilities

1. **Service Aggregation Logic**:
   - Communicate with `backend-system` and `backend-request` via `WebClient` (Reactive).
   - Use `Mono.zip` to fetch metrics concurrently and minimize response latency.
   - Aggregate raw counts into logical `DashboardSummaryDTO` models.

2. **Metrics & KPI Calculation**:
   - Implement filtering logic for "Created Today," "Closed Today," and "Open Requests."
   - Provide status-based distribution metrics for charts (Pie, Bar).
   - Plan for future time-series data implementation (Trends).

3. **Multi-Tenancy Filtering**:
   - Enforce `company_id` isolation logic when fetching stats for non-admin users.
   - Ensure the dashboard displays only relevant data based on the authenticated user's role.

4. **API Gateway & CORS**:
   - Maintain compatibility with the Nginx API Gateway routing (`/api/v1/dashboard/**`).
   - Propagate JWT cookies (`ITSMSession`) through `WebClient` for downstream authentication.

## Technical Standards

- **Tech Stack**: Java 17, Spring Boot 3.x (WebFlux/Reactive Stack for aggregation), MariaDB (Shared connection).
- **Communication**: Use `WebClient` with cookie propagation for inter-service calls.
- **Aggregation Pattern**: Prefer `Mono.zip` over sequential calls for performance.

## Key Patterns

### Reactive Aggregator Pattern
Always use `Mono.zip` when multiple independent services are involved to avoid blocking.

```java
public Mono<DashboardSummaryDTO> getSummary(String companyId, String token) {
    Mono<Map> systemStats = apiService.getSystemStats(companyId, token);
    Mono<Map> requestStats = apiService.getRequestStats(companyId, token);
    
    return Mono.zip(systemStats, requestStats)
            .map(tuple -> aggregate(tuple.getT1(), tuple.getT2()));
}
```

### Cookie Propagation
Ensure the `ITSMSession` cookie from the incoming request is passed to downstream `WebClient` calls.

```java
return webClient.get()
        .uri(uri)
        .cookie("ITSMSession", token)
        .retrieve()
        .bodyToMono(Map.class);
```

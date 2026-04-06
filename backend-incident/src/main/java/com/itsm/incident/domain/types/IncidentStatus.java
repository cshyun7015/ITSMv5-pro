package com.itsm.incident.domain.types;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public enum IncidentStatus {
    NEW, 
    ASSIGNED, 
    IN_PROGRESS, 
    ON_HOLD, 
    RESOLVED, 
    CLOSED;

    /**
     * 현재 상태에서 전이 가능한 다음 상태 목록을 반환합니다.
     */
    public List<IncidentStatus> getNextAllowedStates() {
        return switch (this) {
            case NEW -> Arrays.asList(ASSIGNED, ON_HOLD, CLOSED);
            case ASSIGNED -> Arrays.asList(IN_PROGRESS, ON_HOLD, CLOSED);
            case IN_PROGRESS -> Arrays.asList(RESOLVED, ON_HOLD, ASSIGNED);
            case ON_HOLD -> Arrays.asList(IN_PROGRESS, ASSIGNED, CLOSED);
            case RESOLVED -> Arrays.asList(CLOSED, IN_PROGRESS); 
            case CLOSED -> Collections.emptyList();
        };
    }

    public boolean canTransitionTo(IncidentStatus nextState) {
        return getNextAllowedStates().contains(nextState);
    }
}

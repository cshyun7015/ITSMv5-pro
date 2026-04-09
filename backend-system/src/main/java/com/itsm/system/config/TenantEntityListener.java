package com.itsm.system.config;

import com.itsm.system.domain.common.BaseTenantEntity;
import com.itsm.system.security.TenantContext;
import jakarta.persistence.PrePersist;
import lombok.extern.slf4j.Slf4j;

/**
 * JPA Entity Listener to automatically inject TenantId from TenantContext
 * before persisting entities that extend BaseTenantEntity.
 */
@Slf4j
public class TenantEntityListener {

    @PrePersist
    public void prePersist(Object entity) {
        if (entity instanceof BaseTenantEntity) {
            String tenantId = TenantContext.getTenantId();
            if (tenantId != null) {
                ((BaseTenantEntity) entity).setTenantId(tenantId);
                log.trace("Injected tenantId [{}] into entity of type [{}]", tenantId, entity.getClass().getSimpleName());
            } else {
                log.warn("Attempted to persist TenantEntity [{}] but TenantID is null in TenantContext", entity.getClass().getSimpleName());
            }
        }
    }
}

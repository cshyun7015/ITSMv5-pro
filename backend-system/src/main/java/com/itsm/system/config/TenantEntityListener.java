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
        if (entity instanceof BaseTenantEntity tenantEntity) {
            String currentContextTenantId = TenantContext.getTenantId();
            String existingTenantId = tenantEntity.getTenantId();

            // Inject current context only if existing tenantId is null or the default 'MSP'
            if (existingTenantId == null || TenantContext.DEFAULT_TENANT.equals(existingTenantId)) {
                if (currentContextTenantId != null) {
                    tenantEntity.setTenantId(currentContextTenantId);
                    log.trace("Injected tenantId [{}] into entity of type [{}]", currentContextTenantId, entity.getClass().getSimpleName());
                } else {
                    log.warn("Attempted to persist TenantEntity [{}] but TenantID is null in TenantContext", entity.getClass().getSimpleName());
                }
            } else {
                log.trace("Preserving manually set tenantId [{}] for entity of type [{}]", existingTenantId, entity.getClass().getSimpleName());
            }
        }
    }
}

package com.itsm.system.config;

import com.itsm.system.security.TenantContext;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.hibernate.Session;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

/**
 * Aspect to automatically enable Hibernate Filters for Multi-tenancy and Soft Delete.
 * Uses ObjectProvider for lazy initialization of EntityManager to avoid circular dependencies during context startup.
 */
@Aspect
@Component
@Slf4j
@RequiredArgsConstructor
public class TenantFilterAspect {

    private final ObjectProvider<EntityManager> entityManagerProvider;

    @Before("execution(* com.itsm.system.service..*.*(..))")
    public void enableFilters() {
        EntityManager entityManager = entityManagerProvider.getIfAvailable();
        if (entityManager == null) {
            return;
        }

        Session session = entityManager.unwrap(Session.class);
        
        // Enable Tenant Filter
        String tenantId = TenantContext.getTenantId();
        if (tenantId != null) {
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
        }
        
        // Enable Deleted Filter (default to showing only non-deleted items)
        session.enableFilter("deletedFilter").setParameter("isDeleted", false);
        
        log.trace("Activated Hibernate filters in session: tenantId={}, isDeleted=false", tenantId);
    }
}

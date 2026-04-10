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
        String userCompanyId = TenantContext.getUserCompanyId();
        
        boolean isMspHeader = TenantContext.DEFAULT_TENANT.equals(tenantId);
        boolean isMspUser = TenantContext.DEFAULT_TENANT.equals(userCompanyId);

        if (isMspUser || isMspHeader) {
            // Superuser bypass: Disable all filters
            session.disableFilter("tenantFilter");
            session.disableFilter("deletedFilter");
            log.trace("Disabled Hibernate filters for MSP (SuperUser/Admin) session: userCompany={}, tenantHeader={}", userCompanyId, tenantId);
        } else if (tenantId != null) {
            // Regular tenant user: Enable filters
            session.enableFilter("tenantFilter").setParameter("tenantId", tenantId);
            session.enableFilter("deletedFilter").setParameter("isDeleted", false);
            log.trace("Activated Hibernate filters in session: tenantId={}, isDeleted=false", tenantId);
        }
    }
}

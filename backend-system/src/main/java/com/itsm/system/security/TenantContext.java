package com.itsm.system.security;

import lombok.extern.slf4j.Slf4j;

/**
 * ThreadLocal storage for the current tenant context.
 */
@Slf4j
public class TenantContext {

    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    public static final String DEFAULT_TENANT = "MSP";

    public static void setTenantId(String tenantId) {
        log.debug("Setting tenant context to: {}", tenantId);
        CURRENT_TENANT.set(tenantId);
    }

    public static String getTenantId() {
        String tenantId = CURRENT_TENANT.get();
        return (tenantId != null) ? tenantId : DEFAULT_TENANT;
    }

    public static void clear() {
        log.debug("Clearing tenant context");
        CURRENT_TENANT.remove();
    }
}

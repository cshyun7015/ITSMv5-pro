package com.itsm.system.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Servlet Filter to extract Tenant ID from HTTP Header and set it in TenantContext.
 */
@Component
@Slf4j
public class TenantContextFilter extends OncePerRequestFilter {

    private static final String TENANT_HEADER = "X-Tenant-ID";

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String tenantId = request.getHeader(TENANT_HEADER);

        if (tenantId != null && !tenantId.isEmpty()) {
            try {
                // Decode URL-encoded tenantId to support non-ASCII characters (e.g., Korean)
                tenantId = java.net.URLDecoder.decode(tenantId, java.nio.charset.StandardCharsets.UTF_8);
                log.debug("Found Tenant-ID in header: {}", tenantId);
                TenantContext.setTenantId(tenantId);
            } catch (Exception e) {
                log.warn("Failed to decode Tenant-ID: {}", tenantId, e);
                TenantContext.setTenantId(tenantId); // Fallback to raw value
            }
        } else {
            log.trace("No Tenant-ID found in header, using default context");
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            // Clear context after request to avoid thread-local leakage
            TenantContext.clear();
        }
    }
}

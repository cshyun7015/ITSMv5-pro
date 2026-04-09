package com.itsm.system.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Configuration for JPA Auditing (CreatedBy, LastModifiedBy).
 * Explicitly references the auditorProvider bean defined in AuditorAwareImpl.
 */
@Configuration
@EnableJpaAuditing(auditorAwareRef = "auditorAwareImpl")
public class JpaAuditingConfig {
    // Audit configuration enabled via annotations
}

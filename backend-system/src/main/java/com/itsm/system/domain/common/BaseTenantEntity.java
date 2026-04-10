package com.itsm.system.domain.common;

import com.itsm.system.config.TenantEntityListener;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.ParamDef;

/**
 * Base abstract class for entities with Multi-tenancy and Soft Delete support.
 */
@MappedSuperclass
@EntityListeners(TenantEntityListener.class)
@Getter
@Setter
@FilterDef(name = "tenantFilter", parameters = @ParamDef(name = "tenantId", type = String.class))
@Filter(name = "tenantFilter", condition = "tenant_id = :tenantId")
public abstract class BaseTenantEntity extends BaseEntity {

    @Column(name = "tenant_id", length = 50)
    private String tenantId = "MSP"; // Default for now

    @Column(name = "is_deleted")
    private Boolean isDeleted = false;
}

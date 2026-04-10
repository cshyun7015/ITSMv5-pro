package com.itsm.system.domain.code;

import com.itsm.system.domain.common.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import org.hibernate.annotations.SQLDelete;

@Entity
@Table(name = "code_groups", schema = "system_mgmt")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE code_groups SET is_deleted = 1 WHERE group_id = ?")
public class CodeGroup extends BaseEntity {
    @Id
    @Column(name = "group_id", length = 50)
    private String groupId;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_system")
    private Boolean isSystem;
}

package com.itsm.system.domain.organization.mapping;

import com.itsm.system.domain.organization.operator.Operator;
import com.itsm.system.domain.organization.operator.OperatorTeam;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;

@Entity
@Table(name = "operator_team_members")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorTeamMember {

    @EmbeddedId
    @Builder.Default
    private OperatorTeamMemberId id = new OperatorTeamMemberId();

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("operatorId")
    @JoinColumn(name = "operator_id")
    private Operator operator;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("operatorTeamId")
    @JoinColumn(name = "operator_team_id")
    private OperatorTeam operatorTeam;

    @Embeddable
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @EqualsAndHashCode
    public static class OperatorTeamMemberId implements Serializable {
        private Long operatorId;
        private Long operatorTeamId;
    }
}

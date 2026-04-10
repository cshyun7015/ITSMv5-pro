package com.itsm.system.dto.mapping;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamCustomerMapDTO {
    private Long operatorTeamId;
    private String operatorTeamName;
    private Long customerCompanyId;
    private String customerCompanyName;
}

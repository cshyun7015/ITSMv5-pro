package com.itsm.system.dto.stats;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemStatsDTO {
    private long companyCount;
    private long userCount;
}

package com.itsm.system.dto.company;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequestDTO {
    private String companyId;
    private String name;
    private String businessNumber;
    private String representativeName;
    private String phone;
    private String email;
    private String address;
    private String status;
}

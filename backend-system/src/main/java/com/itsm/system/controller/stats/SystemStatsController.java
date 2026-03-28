package com.itsm.system.controller.stats;

import com.itsm.system.domain.company.CompanyRepository;
import com.itsm.system.domain.user.UserRepository;
import com.itsm.system.dto.stats.SystemStatsDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/system/stats")
@RequiredArgsConstructor
public class SystemStatsController {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    @GetMapping("/summary")
    public SystemStatsDTO getSummary() {
        return SystemStatsDTO.builder()
                .companyCount(companyRepository.count())
                .userCount(userRepository.count())
                .build();
    }
}

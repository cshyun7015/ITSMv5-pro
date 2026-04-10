package com.itsm.system.controller.operator.mapping;

import com.itsm.system.domain.common.ApiResponse;
import com.itsm.system.dto.mapping.TeamCustomerMapDTO;
import com.itsm.system.service.operator.mapping.TeamCustomerMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/operator/mapping")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class TeamCustomerMapController {

    private final TeamCustomerMapService mappingService;

    @GetMapping
    public ApiResponse<List<TeamCustomerMapDTO>> getAllMappings() {
        return ApiResponse.success(mappingService.getAllMappings());
    }

    @GetMapping("/team/{teamId}")
    public ApiResponse<List<TeamCustomerMapDTO>> getMappingsByTeam(@PathVariable Long teamId) {
        return ApiResponse.success(mappingService.getMappingsByTeam(teamId));
    }

    @GetMapping("/customer/{customerId}")
    public ApiResponse<List<TeamCustomerMapDTO>> getMappingsByCustomer(@PathVariable Long customerId) {
        return ApiResponse.success(mappingService.getMappingsByCustomer(customerId));
    }

    @PostMapping("/{teamId}/{customerId}")
    public ApiResponse<TeamCustomerMapDTO> assignTeamToCustomer(
            @PathVariable Long teamId,
            @PathVariable Long customerId) {
        return ApiResponse.success(mappingService.assignTeamToCustomer(teamId, customerId));
    }

    @DeleteMapping("/{teamId}/{customerId}")
    public ApiResponse<Void> unassignTeamFromCustomer(
            @PathVariable Long teamId,
            @PathVariable Long customerId) {
        mappingService.unassignTeamFromCustomer(teamId, customerId);
        return ApiResponse.success(null);
    }
}

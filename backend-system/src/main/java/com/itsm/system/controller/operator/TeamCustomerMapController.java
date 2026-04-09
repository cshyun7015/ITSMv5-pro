package com.itsm.system.controller.organization.mapping;

import com.itsm.system.dto.organization.mapping.TeamCustomerMapDTO;
import com.itsm.system.service.organization.mapping.TeamCustomerMapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/system/organization/mappings")
@RequiredArgsConstructor
public class TeamCustomerMapController {

    private final TeamCustomerMapService mappingService;

    @GetMapping("/team/{teamId}")
    public ResponseEntity<List<TeamCustomerMapDTO>> getMappingsByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(mappingService.getMappingsByTeam(teamId));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<TeamCustomerMapDTO>> getMappingsByCustomer(@PathVariable Long customerId) {
        return ResponseEntity.ok(mappingService.getMappingsByCustomer(customerId));
    }

    @PostMapping("/{teamId}/{customerId}")
    public ResponseEntity<TeamCustomerMapDTO> assignTeamToCustomer(
            @PathVariable Long teamId,
            @PathVariable Long customerId) {
        return ResponseEntity.ok(mappingService.assignTeamToCustomer(teamId, customerId));
    }

    @DeleteMapping("/{teamId}/{customerId}")
    public ResponseEntity<Void> unassignTeamFromCustomer(
            @PathVariable Long teamId,
            @PathVariable Long customerId) {
        mappingService.unassignTeamFromCustomer(teamId, customerId);
        return ResponseEntity.noContent().build();
    }
}

package com.itsm.system.controller.operator;

import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.service.organization.operator.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/operator")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorService operatorService;

    // --- Operator Side ---
    @GetMapping("/companies")
    public ResponseEntity<List<OperatorCompanyDTO>> getAllOperatorCompanies() {
        return ResponseEntity.ok(operatorService.getAllCompanies());
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<OperatorCompanyDTO> getOperatorCompany(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getCompany(id));
    }

    @PostMapping("/companies")
    public ResponseEntity<OperatorCompanyDTO> createOperatorCompany(@RequestBody OperatorCompanyDTO dto) {
        return ResponseEntity.ok(operatorService.createCompany(dto));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<OperatorCompanyDTO> updateOperatorCompany(@PathVariable Long id, @RequestBody OperatorCompanyDTO dto) {
        return ResponseEntity.ok(operatorService.updateCompany(id, dto));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteOperatorCompany(@PathVariable Long id) {
        operatorService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/companies/{companyId}/teams")
    public ResponseEntity<List<OperatorTeamDTO>> getOperatorTeams(@PathVariable Long companyId) {
        return ResponseEntity.ok(operatorService.getTeamsByCompany(companyId));
    }

    @GetMapping("/teams")
    public ResponseEntity<List<OperatorTeamDTO>> getAllTeams() {
        return ResponseEntity.ok(operatorService.getAllTeams());
    }

    @GetMapping("/teams/{id}")
    public ResponseEntity<OperatorTeamDTO> getOperatorTeam(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getTeam(id));
    }

    @PostMapping("/companies/{companyId}/teams")
    public ResponseEntity<OperatorTeamDTO> createOperatorTeam(@PathVariable Long companyId, @RequestBody OperatorTeamDTO dto) {
        return ResponseEntity.ok(operatorService.createTeam(companyId, dto));
    }

    @PutMapping("/teams/{id}")
    public ResponseEntity<OperatorTeamDTO> updateOperatorTeam(@PathVariable Long id, @RequestBody OperatorTeamDTO dto) {
        return ResponseEntity.ok(operatorService.updateTeam(id, dto));
    }

    @DeleteMapping("/teams/{id}")
    public ResponseEntity<Void> deleteOperatorTeam(@PathVariable Long id) {
        operatorService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/teams/{teamId}/operators")
    public ResponseEntity<List<OperatorDTO>> getOperatorsByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(operatorService.getOperatorsByTeam(teamId));
    }

    @GetMapping("/operators")
    public ResponseEntity<List<OperatorDTO>> getAllOperators() {
        return ResponseEntity.ok(operatorService.getAllOperators());
    }

    @GetMapping("/operators/{id}")
    public ResponseEntity<OperatorDTO> getOperator(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getOperator(id));
    }

    @PostMapping("/teams/{teamId}/operators")
    public ResponseEntity<OperatorDTO> createOperator(@PathVariable Long teamId, @RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(operatorService.createOperator(teamId, dto));
    }

    @PutMapping("/operators/{id}")
    public ResponseEntity<OperatorDTO> updateOperator(@PathVariable Long id, @RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(operatorService.updateOperator(id, dto));
    }

    @DeleteMapping("/operators/{id}")
    public ResponseEntity<Void> deleteOperator(@PathVariable Long id) {
        operatorService.deleteOperator(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/operators/{id}/teams/{teamId}")
    public ResponseEntity<Void> assignTeam(@PathVariable Long id, @PathVariable Long teamId) {
        operatorService.assignTeam(id, teamId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/operators/{id}/teams/{teamId}")
    public ResponseEntity<Void> unassignTeam(@PathVariable Long id, @PathVariable Long teamId) {
        operatorService.unassignTeam(id, teamId);
        return ResponseEntity.ok().build();
    }
}

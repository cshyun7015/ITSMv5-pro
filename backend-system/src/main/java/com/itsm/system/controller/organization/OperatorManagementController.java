package com.itsm.system.controller.organization;

import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.service.organization.operator.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/organization")
@RequiredArgsConstructor
public class OperatorManagementController {

    private final OperatorService operatorService;

    // --- Operator Side ---
    @GetMapping("/operators/companies")
    public ResponseEntity<List<OperatorCompanyDTO>> getAllOperatorCompanies() {
        return ResponseEntity.ok(operatorService.getAllCompanies());
    }

    @GetMapping("/operators/companies/{id}")
    public ResponseEntity<OperatorCompanyDTO> getOperatorCompany(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getCompany(id));
    }

    @PostMapping("/operators/companies")
    public ResponseEntity<OperatorCompanyDTO> createOperatorCompany(@RequestBody OperatorCompanyDTO dto) {
        return ResponseEntity.ok(operatorService.createCompany(dto));
    }

    @PutMapping("/operators/companies/{id}")
    public ResponseEntity<OperatorCompanyDTO> updateOperatorCompany(@PathVariable Long id, @RequestBody OperatorCompanyDTO dto) {
        return ResponseEntity.ok(operatorService.updateCompany(id, dto));
    }

    @DeleteMapping("/operators/companies/{id}")
    public ResponseEntity<Void> deleteOperatorCompany(@PathVariable Long id) {
        operatorService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/operators/companies/{companyId}/teams")
    public ResponseEntity<List<OperatorTeamDTO>> getOperatorTeams(@PathVariable Long companyId) {
        return ResponseEntity.ok(operatorService.getTeamsByCompany(companyId));
    }

    @GetMapping("/operators/teams")
    public ResponseEntity<List<OperatorTeamDTO>> getAllTeams() {
        return ResponseEntity.ok(operatorService.getAllTeams());
    }

    @GetMapping("/operators/teams/{id}")
    public ResponseEntity<OperatorTeamDTO> getOperatorTeam(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getTeam(id));
    }

    @PostMapping("/operators/companies/{companyId}/teams")
    public ResponseEntity<OperatorTeamDTO> createOperatorTeam(@PathVariable Long companyId, @RequestBody OperatorTeamDTO dto) {
        return ResponseEntity.ok(operatorService.createTeam(companyId, dto));
    }

    @PutMapping("/operators/teams/{id}")
    public ResponseEntity<OperatorTeamDTO> updateOperatorTeam(@PathVariable Long id, @RequestBody OperatorTeamDTO dto) {
        return ResponseEntity.ok(operatorService.updateTeam(id, dto));
    }

    @DeleteMapping("/operators/teams/{id}")
    public ResponseEntity<Void> deleteOperatorTeam(@PathVariable Long id) {
        operatorService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/operators/teams/{teamId}/operators")
    public ResponseEntity<List<OperatorDTO>> getOperatorsByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(operatorService.getOperatorsByTeam(teamId));
    }

    @GetMapping("/operators/operators")
    public ResponseEntity<List<OperatorDTO>> getAllOperators() {
        return ResponseEntity.ok(operatorService.getAllOperators());
    }

    @GetMapping("/operators/operators/{id}")
    public ResponseEntity<OperatorDTO> getOperator(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getOperator(id));
    }

    @PostMapping("/operators/teams/{teamId}/operators")
    public ResponseEntity<OperatorDTO> createOperator(@PathVariable Long teamId, @RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(operatorService.createOperator(teamId, dto));
    }

    @PutMapping("/operators/operators/{id}")
    public ResponseEntity<OperatorDTO> updateOperator(@PathVariable Long id, @RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(operatorService.updateOperator(id, dto));
    }

    @DeleteMapping("/operators/operators/{id}")
    public ResponseEntity<Void> deleteOperator(@PathVariable Long id) {
        operatorService.deleteOperator(id);
        return ResponseEntity.ok().build();
    }
}

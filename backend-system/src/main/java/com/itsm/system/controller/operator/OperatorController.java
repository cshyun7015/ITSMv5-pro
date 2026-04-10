package com.itsm.system.controller.operator;

import com.itsm.system.domain.common.ApiResponse;
import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.service.operator.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/operator")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorService operatorService;

    // --- Operator Side ---
    @GetMapping("/companies")
    public ApiResponse<List<OperatorCompanyDTO>> getAllOperatorCompanies() {
        return ApiResponse.success(operatorService.getAllCompanies());
    }

    @GetMapping("/companies/{id}")
    public ApiResponse<OperatorCompanyDTO> getOperatorCompany(@PathVariable Long id) {
        return ApiResponse.success(operatorService.getCompany(id));
    }

    @PostMapping("/companies")
    public ApiResponse<OperatorCompanyDTO> createOperatorCompany(@RequestBody OperatorCompanyDTO dto) {
        return ApiResponse.success(operatorService.createCompany(dto));
    }

    @PutMapping("/companies/{id}")
    public ApiResponse<OperatorCompanyDTO> updateOperatorCompany(@PathVariable Long id, @RequestBody OperatorCompanyDTO dto) {
        return ApiResponse.success(operatorService.updateCompany(id, dto));
    }

    @DeleteMapping("/companies/{id}")
    public ApiResponse<Void> deleteOperatorCompany(@PathVariable Long id) {
        operatorService.deleteCompany(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/companies/{companyId}/teams")
    public ApiResponse<List<OperatorTeamDTO>> getOperatorTeams(@PathVariable Long companyId) {
        return ApiResponse.success(operatorService.getTeamsByCompany(companyId));
    }

    @GetMapping("/teams")
    public ApiResponse<List<OperatorTeamDTO>> getAllTeams() {
        return ApiResponse.success(operatorService.getAllTeams());
    }

    @GetMapping("/teams/{id}")
    public ApiResponse<OperatorTeamDTO> getOperatorTeam(@PathVariable Long id) {
        return ApiResponse.success(operatorService.getTeam(id));
    }

    @PostMapping("/companies/{companyId}/teams")
    public ApiResponse<OperatorTeamDTO> createOperatorTeam(@PathVariable Long companyId, @RequestBody OperatorTeamDTO dto) {
        return ApiResponse.success(operatorService.createTeam(companyId, dto));
    }

    @PutMapping("/teams/{id}")
    public ApiResponse<OperatorTeamDTO> updateOperatorTeam(@PathVariable Long id, @RequestBody OperatorTeamDTO dto) {
        return ApiResponse.success(operatorService.updateTeam(id, dto));
    }

    @DeleteMapping("/teams/{id}")
    public ApiResponse<Void> deleteOperatorTeam(@PathVariable Long id) {
        operatorService.deleteTeam(id);
        return ApiResponse.success(null);
    }

    @GetMapping("/teams/{teamId}/operators")
    public ApiResponse<List<OperatorDTO>> getOperatorsByTeam(@PathVariable Long teamId) {
        return ApiResponse.success(operatorService.getOperatorsByTeam(teamId));
    }

    @GetMapping("/operators")
    public ApiResponse<List<OperatorDTO>> getAllOperators() {
        return ApiResponse.success(operatorService.getAllOperators());
    }

    @GetMapping("/operators/{id}")
    public ApiResponse<OperatorDTO> getOperator(@PathVariable Long id) {
        return ApiResponse.success(operatorService.getOperator(id));
    }

    @PostMapping("/teams/{teamId}/operators")
    public ApiResponse<OperatorDTO> createOperator(@PathVariable Long teamId, @RequestBody OperatorDTO dto) {
        return ApiResponse.success(operatorService.createOperator(teamId, dto));
    }

    @PutMapping("/operators/{id}")
    public ApiResponse<OperatorDTO> updateOperator(@PathVariable Long id, @RequestBody OperatorDTO dto) {
        return ApiResponse.success(operatorService.updateOperator(id, dto));
    }

    @DeleteMapping("/operators/{id}")
    public ApiResponse<Void> deleteOperator(@PathVariable Long id, @RequestParam(required = false, defaultValue = "false") boolean hardDelete) {
        operatorService.deleteOperator(id, hardDelete);
        return ApiResponse.success(null);
    }

    @PostMapping("/operators/{id}/teams/{teamId}")
    public ApiResponse<Void> assignTeam(@PathVariable Long id, @PathVariable Long teamId) {
        operatorService.assignTeam(id, teamId);
        return ApiResponse.success(null);
    }

    @DeleteMapping("/operators/{id}/teams/{teamId}")
    public ApiResponse<Void> unassignTeam(@PathVariable Long id, @PathVariable Long teamId) {
        operatorService.unassignTeam(id, teamId);
        return ApiResponse.success(null);
    }
}

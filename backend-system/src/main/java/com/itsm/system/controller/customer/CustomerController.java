package com.itsm.system.controller.customer;

import com.itsm.system.domain.common.ApiResponse;
import com.itsm.system.dto.customer.CustomerCompanyDTO;
import com.itsm.system.dto.customer.CustomerTeamDTO;
import com.itsm.system.dto.customer.CustomerUserDTO;
import com.itsm.system.service.customer.CustomerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Standardized Controller for Customer Organization Management.
 */
@RestController
@RequestMapping("/v1/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    // --- Customer Company CRUD ---
    @GetMapping("/companies")
    public ApiResponse<List<CustomerCompanyDTO>> getAllCompanies() {
        return ApiResponse.success(customerService.getAllCompanies());
    }

    @GetMapping("/companies/{id}")
    public ApiResponse<CustomerCompanyDTO> getCompany(@PathVariable Long id) {
        return ApiResponse.success(customerService.getCompany(id));
    }

    @PostMapping("/companies")
    public ApiResponse<CustomerCompanyDTO> createCompany(@Valid @RequestBody CustomerCompanyDTO dto) {
        return ApiResponse.success(customerService.createCompany(dto));
    }

    @PutMapping("/companies/{id}")
    public ApiResponse<CustomerCompanyDTO> updateCompany(@PathVariable Long id, @Valid @RequestBody CustomerCompanyDTO dto) {
        return ApiResponse.success(customerService.updateCompany(id, dto));
    }

    @DeleteMapping("/companies/{id}")
    public ApiResponse<Void> deleteCompany(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean hardDelete) {
        customerService.deleteCompany(id, hardDelete);
        return ApiResponse.success(null);
    }

    // --- Customer Team CRUD & Hierarchy ---
    @GetMapping("/companies/{companyId}/teams")
    public ApiResponse<List<CustomerTeamDTO>> getTeamsByCompany(@PathVariable Long companyId) {
        return ApiResponse.success(customerService.getTeamsByCompany(companyId));
    }

    @GetMapping("/companies/{companyId}/customer-tree")
    public ApiResponse<List<CustomerTeamDTO>> getOrganizationTree(@PathVariable Long companyId) {
        return ApiResponse.success(customerService.getOrganizationTree(companyId));
    }

    @PostMapping("/companies/{companyId}/teams")
    public ApiResponse<CustomerTeamDTO> createTeam(@PathVariable Long companyId, @Valid @RequestBody CustomerTeamDTO dto) {
        return ApiResponse.success(customerService.createTeam(companyId, dto));
    }

    @GetMapping("/teams/{id}")
    public ApiResponse<CustomerTeamDTO> getTeam(@PathVariable Long id) {
        return ApiResponse.success(customerService.getTeam(id));
    }

    @PutMapping("/teams/{id}")
    public ApiResponse<CustomerTeamDTO> updateTeam(@PathVariable Long id, @Valid @RequestBody CustomerTeamDTO dto) {
        return ApiResponse.success(customerService.updateTeam(id, dto));
    }

    @DeleteMapping("/teams/{id}")
    public ApiResponse<Void> deleteTeam(@PathVariable Long id, @RequestParam(defaultValue = "false") boolean hardDelete) {
        customerService.deleteTeam(id, hardDelete);
        return ApiResponse.success(null);
    }

    // --- Customer User CRUD ---
    @GetMapping("/teams/{teamId}/users")
    public ApiResponse<List<CustomerUserDTO>> getUsersByTeam(@PathVariable Long teamId) {
        return ApiResponse.success(customerService.getUsersByTeam(teamId));
    }

    @PostMapping("/teams/{teamId}/users")
    public ApiResponse<CustomerUserDTO> createUser(@PathVariable Long teamId, @Valid @RequestBody CustomerUserDTO dto) {
        return ApiResponse.success(customerService.createUser(teamId, dto));
    }

    @GetMapping("/users/{id}")
    public ApiResponse<CustomerUserDTO> getUser(@PathVariable Long id) {
        return ApiResponse.success(customerService.getUser(id));
    }

    @PutMapping("/users/{id}")
    public ApiResponse<CustomerUserDTO> updateUser(@PathVariable Long id, @Valid @RequestBody CustomerUserDTO dto) {
        return ApiResponse.success(customerService.updateUser(id, dto));
    }

    @DeleteMapping("/users/{id}")
    public ApiResponse<Void> deleteUser(@PathVariable Long id) {
        customerService.deleteUser(id);
        return ApiResponse.success(null);
    }
}

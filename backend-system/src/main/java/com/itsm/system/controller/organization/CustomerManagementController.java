package com.itsm.system.controller.organization;

import com.itsm.system.dto.organization.customer.CustomerCompanyDTO;
import com.itsm.system.dto.organization.customer.CustomerTeamDTO;
import com.itsm.system.dto.organization.customer.CustomerUserDTO;
import com.itsm.system.service.organization.customer.CustomerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/customer-governance")
@RequiredArgsConstructor
public class CustomerManagementController {

    private final CustomerService customerService;

    // --- Customer Company CRUD ---
    @GetMapping("/companies")
    public ResponseEntity<List<CustomerCompanyDTO>> getAllCompanies() {
        return ResponseEntity.ok(customerService.getAllCompanies());
    }

    @GetMapping("/companies/{id}")
    public ResponseEntity<CustomerCompanyDTO> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getCompany(id));
    }

    @PostMapping("/companies")
    public ResponseEntity<CustomerCompanyDTO> createCompany(@RequestBody CustomerCompanyDTO dto) {
        return ResponseEntity.ok(customerService.createCompany(dto));
    }

    @PutMapping("/companies/{id}")
    public ResponseEntity<CustomerCompanyDTO> updateCompany(@PathVariable Long id, @RequestBody CustomerCompanyDTO dto) {
        return ResponseEntity.ok(customerService.updateCompany(id, dto));
    }

    @DeleteMapping("/companies/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        customerService.deleteCompany(id);
        return ResponseEntity.ok().build();
    }

    // --- Customer Team CRUD ---
    @GetMapping("/companies/{companyId}/teams")
    public ResponseEntity<List<CustomerTeamDTO>> getTeamsByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(customerService.getTeamsByCompany(companyId));
    }

    @PostMapping("/companies/{companyId}/teams")
    public ResponseEntity<CustomerTeamDTO> createTeam(@PathVariable Long companyId, @RequestBody CustomerTeamDTO dto) {
        return ResponseEntity.ok(customerService.createTeam(companyId, dto));
    }

    @GetMapping("/teams/{id}")
    public ResponseEntity<CustomerTeamDTO> getTeam(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getTeam(id));
    }

    @PutMapping("/teams/{id}")
    public ResponseEntity<CustomerTeamDTO> updateTeam(@PathVariable Long id, @RequestBody CustomerTeamDTO dto) {
        return ResponseEntity.ok(customerService.updateTeam(id, dto));
    }

    @DeleteMapping("/teams/{id}")
    public ResponseEntity<Void> deleteTeam(@PathVariable Long id) {
        customerService.deleteTeam(id);
        return ResponseEntity.ok().build();
    }

    // --- Customer User CRUD ---
    @GetMapping("/teams/{teamId}/users")
    public ResponseEntity<List<CustomerUserDTO>> getUsersByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(customerService.getUsersByTeam(teamId));
    }

    @PostMapping("/teams/{teamId}/users")
    public ResponseEntity<CustomerUserDTO> createUser(@PathVariable Long teamId, @RequestBody CustomerUserDTO dto) {
        return ResponseEntity.ok(customerService.createUser(teamId, dto));
    }

    @GetMapping("/users/{id}")
    public ResponseEntity<CustomerUserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(customerService.getUser(id));
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<CustomerUserDTO> updateUser(@PathVariable Long id, @RequestBody CustomerUserDTO dto) {
        return ResponseEntity.ok(customerService.updateUser(id, dto));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        customerService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
}

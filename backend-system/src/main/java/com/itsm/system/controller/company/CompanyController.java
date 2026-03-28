package com.itsm.system.controller.company;

import com.itsm.system.dto.company.CompanyRequestDTO;
import com.itsm.system.dto.company.CompanyResponseDTO;
import com.itsm.system.service.company.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping
    public ResponseEntity<CompanyResponseDTO> createCompany(
            @RequestHeader(value = "X-Company-ID", required = false) String companyId,
            @RequestBody CompanyRequestDTO dto) {
        // If companyId is provided in header, we can use it or validate against body
        return ResponseEntity.status(HttpStatus.CREATED).body(companyService.createCompany(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> getCompany(@PathVariable Long id) {
        return ResponseEntity.ok(companyService.getCompany(id));
    }

    @GetMapping("/business/{companyId}")
    public ResponseEntity<CompanyResponseDTO> getCompanyByBusinessId(@PathVariable String companyId) {
        return ResponseEntity.ok(companyService.getCompanyByBusinessId(companyId));
    }

    @GetMapping
    public ResponseEntity<List<CompanyResponseDTO>> getAllCompanies() {
        return ResponseEntity.ok(companyService.getAllCompanies());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDTO> updateCompany(
            @PathVariable Long id,
            @RequestBody CompanyRequestDTO dto) {
        return ResponseEntity.ok(companyService.updateCompany(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        return ResponseEntity.noContent().build();
    }
}

package com.itsm.system.service.company;

import com.itsm.system.dto.company.CompanyRequestDTO;
import com.itsm.system.dto.company.CompanyResponseDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface CompanyService {
    CompanyResponseDTO createCompany(CompanyRequestDTO dto);
    CompanyResponseDTO getCompany(Long id);
    CompanyResponseDTO getCompanyByBusinessId(String companyId);
    List<CompanyResponseDTO> getAllCompanies();
    Page<CompanyResponseDTO> searchCompanies(String name, String status, Pageable pageable);
    CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO dto);
    void deleteCompany(Long id);
}

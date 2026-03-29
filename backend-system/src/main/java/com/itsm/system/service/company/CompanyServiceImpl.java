package com.itsm.system.service.company;

import com.itsm.system.domain.company.Company;
import com.itsm.system.domain.company.CompanyRepository;
import com.itsm.system.dto.company.CompanyRequestDTO;
import com.itsm.system.dto.company.CompanyResponseDTO;
import com.itsm.system.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.criteria.Predicate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;

    @Override
    public Page<CompanyResponseDTO> searchCompanies(String name, String status, Pageable pageable) {
        Specification<Company> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (name != null && !name.isEmpty()) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (status != null && !status.isEmpty() && !"ALL".equalsIgnoreCase(status)) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
        return companyRepository.findAll(spec, pageable).map(this::convertToDTO);
    }

    @Override
    @Transactional
    public CompanyResponseDTO createCompany(CompanyRequestDTO dto) {
        if (companyRepository.existsByCompanyId(dto.getCompanyId())) {
            throw new BusinessException("Company ID already exists: " + dto.getCompanyId(), HttpStatus.CONFLICT);
        }
        Company company = Company.builder()
                .companyId(dto.getCompanyId())
                .name(dto.getName())
                .businessNumber(dto.getBusinessNumber())
                .representativeName(dto.getRepresentativeName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .status(dto.getStatus() == null ? "ACTIVE" : dto.getStatus())
                .build();
        return convertToDTO(companyRepository.save(company));
    }

    @Override
    public CompanyResponseDTO getCompany(Long id) {
        return companyRepository.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new BusinessException("Company not found with id: " + id, HttpStatus.NOT_FOUND));
    }

    @Override
    public CompanyResponseDTO getCompanyByBusinessId(String companyId) {
        return companyRepository.findByCompanyId(companyId)
                .map(this::convertToDTO)
                .orElseThrow(() -> new BusinessException("Company not found with business id: " + companyId, HttpStatus.NOT_FOUND));
    }

    @Override
    public List<CompanyResponseDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CompanyResponseDTO updateCompany(Long id, CompanyRequestDTO dto) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Company not found with id: " + id, HttpStatus.NOT_FOUND));
        
        company.setName(dto.getName());
        company.setBusinessNumber(dto.getBusinessNumber());
        company.setRepresentativeName(dto.getRepresentativeName());
        company.setPhone(dto.getPhone());
        company.setEmail(dto.getEmail());
        company.setAddress(dto.getAddress());
        company.setStatus(dto.getStatus());
        
        return convertToDTO(company);
    }

    @Override
    @Transactional
    public void deleteCompany(Long id) {
        if (!companyRepository.existsById(id)) {
            throw new BusinessException("Company not found with id: " + id, HttpStatus.NOT_FOUND);
        }
        companyRepository.deleteById(id);
    }

    private CompanyResponseDTO convertToDTO(Company company) {
        return CompanyResponseDTO.builder()
                .id(company.getId())
                .companyId(company.getCompanyId())
                .name(company.getName())
                .businessNumber(company.getBusinessNumber())
                .representativeName(company.getRepresentativeName())
                .phone(company.getPhone())
                .email(company.getEmail())
                .address(company.getAddress())
                .status(company.getStatus())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}

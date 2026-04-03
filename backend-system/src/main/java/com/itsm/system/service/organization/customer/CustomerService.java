package com.itsm.system.service.organization.customer;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.customer.CustomerTeam;
import com.itsm.system.domain.organization.customer.CustomerUser;
import com.itsm.system.dto.organization.customer.CustomerCompanyDTO;
import com.itsm.system.dto.organization.customer.CustomerTeamDTO;
import com.itsm.system.dto.organization.customer.CustomerUserDTO;
import com.itsm.system.repository.organization.customer.CustomerCompanyRepository;
import com.itsm.system.repository.organization.customer.CustomerTeamRepository;
import com.itsm.system.repository.organization.customer.CustomerUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerService {

    private final CustomerCompanyRepository companyRepository;
    private final CustomerTeamRepository teamRepository;
    private final CustomerUserRepository userRepository;

    public List<CustomerCompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToCompanyDTO)
                .collect(Collectors.toList());
    }

    public CustomerCompanyDTO getCompany(Long id) {
        return companyRepository.findById(id)
                .map(this::convertToCompanyDTO)
                .orElseThrow(() -> new RuntimeException("Company not found"));
    }

    public List<CustomerTeamDTO> getTeamsByCompany(Long companyId) {
        return teamRepository.findByCustomerCompanyId(companyId).stream()
                .map(this::convertToTeamDTO)
                .collect(Collectors.toList());
    }

    public List<CustomerUserDTO> getUsersByTeam(Long teamId) {
        return userRepository.findByCustomerTeamId(teamId).stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    // --- Company CRUD ---
    @Transactional
    public CustomerCompanyDTO createCompany(CustomerCompanyDTO dto) {
        CustomerCompany company = CustomerCompany.builder()
                .customerId(dto.getCustomerId())
                .name(dto.getName())
                .businessNumber(dto.getBusinessNumber())
                .representativeName(dto.getRepresentativeName())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .address(dto.getAddress())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();
        return convertToCompanyDTO(companyRepository.save(company));
    }

    @Transactional
    public CustomerCompanyDTO updateCompany(Long id, CustomerCompanyDTO dto) {
        CustomerCompany company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        company.setName(dto.getName());
        company.setBusinessNumber(dto.getBusinessNumber());
        company.setRepresentativeName(dto.getRepresentativeName());
        company.setPhone(dto.getPhone());
        company.setEmail(dto.getEmail());
        company.setAddress(dto.getAddress());
        company.setStatus(dto.getStatus());
        return convertToCompanyDTO(companyRepository.save(company));
    }

    @Transactional
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }

    // --- Team CRUD & Mapping ---
    @Transactional
    public CustomerTeamDTO createTeam(Long companyId, CustomerTeamDTO dto) {
        CustomerCompany company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found"));
        CustomerTeam team = CustomerTeam.builder()
                .customerCompany(company)
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public CustomerTeamDTO updateTeam(Long id, CustomerTeamDTO dto) {
        CustomerTeam team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setName(dto.getName());
        team.setDescription(dto.getDescription());
        
        if (dto.getCustomerCompanyId() != null) {
            CustomerCompany company = companyRepository.findById(dto.getCustomerCompanyId())
                    .orElseThrow(() -> new RuntimeException("Company not found"));
            team.setCustomerCompany(company);
        }
        
        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    // --- User CRUD & Mapping ---
    @Transactional
    public CustomerUserDTO createUser(Long teamId, CustomerUserDTO dto) {
        CustomerTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        CustomerUser user = CustomerUser.builder()
                .customerTeam(team)
                .userId(dto.getUserId())
                .name(dto.getName())
                .email(dto.getEmail())
                .password("$2a$10$8.UnVuG9HHgffUDAlk8Ur.8QLWSc5XqZLn5dUX44n3bc9kW18Wp9y") // Default: password
                .role(dto.getRole() != null ? dto.getRole() : "ROLE_USER")
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        return convertToUserDTO(userRepository.save(user));
    }

    @Transactional
    public CustomerUserDTO updateUser(Long id, CustomerUserDTO dto) {
        CustomerUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setRole(dto.getRole());
        user.setIsActive(dto.getIsActive());
        
        if (dto.getCustomerTeamId() != null) {
            CustomerTeam team = teamRepository.findById(dto.getCustomerTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"));
            user.setCustomerTeam(team);
        }
        
        return convertToUserDTO(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    private CustomerCompanyDTO convertToCompanyDTO(CustomerCompany company) {
        return CustomerCompanyDTO.builder()
                .id(company.getId())
                .customerId(company.getCustomerId())
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

    private CustomerTeamDTO convertToTeamDTO(CustomerTeam team) {
        return CustomerTeamDTO.builder()
                .id(team.getId())
                .customerCompanyId(team.getCustomerCompany().getId())
                .customerCompanyName(team.getCustomerCompany().getName())
                .name(team.getName())
                .description(team.getDescription())
                .createdAt(team.getCreatedAt())
                .build();
    }

    private CustomerUserDTO convertToUserDTO(CustomerUser user) {
        return CustomerUserDTO.builder()
                .id(user.getId())
                .customerTeamId(user.getCustomerTeam().getId())
                .customerTeamName(user.getCustomerTeam().getName())
                .customerCompanyName(user.getCustomerTeam().getCustomerCompany().getName())
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}

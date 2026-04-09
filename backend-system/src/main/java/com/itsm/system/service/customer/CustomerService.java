package com.itsm.system.service.customer;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.customer.CustomerTeam;
import com.itsm.system.domain.organization.customer.CustomerUser;
import com.itsm.system.dto.organization.customer.CustomerCompanyDTO;
import com.itsm.system.dto.organization.customer.CustomerTeamDTO;
import com.itsm.system.dto.organization.customer.CustomerUserDTO;
import com.itsm.system.repository.customer.CustomerCompanyRepository;
import com.itsm.system.repository.customer.CustomerTeamRepository;
import com.itsm.system.repository.customer.CustomerUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class CustomerService {

    private final CustomerCompanyRepository companyRepository;
    private final CustomerTeamRepository teamRepository;
    private final CustomerUserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // --- Company Services ---
    public List<CustomerCompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToCompanyDTO)
                .collect(Collectors.toList());
    }

    public CustomerCompanyDTO getCompany(Long id) {
        return companyRepository.findById(id)
                .map(this::convertToCompanyDTO)
                .orElseThrow(() -> new RuntimeException("Company not found: " + id));
    }

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
                .orElseThrow(() -> new RuntimeException("Company not found: " + id));
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

    // --- Team Services ---
    public List<CustomerTeamDTO> getTeamsByCompany(Long companyId) {
        return teamRepository.findByCustomerCompanyId(companyId).stream()
                .map(this::convertToTeamDTO)
                .collect(Collectors.toList());
    }

    public CustomerTeamDTO getTeam(Long id) {
        return teamRepository.findById(id)
                .map(this::convertToTeamDTO)
                .orElseThrow(() -> new RuntimeException("Team not found: " + id));
    }

    @Transactional
    public CustomerTeamDTO createTeam(Long companyId, CustomerTeamDTO dto) {
        CustomerCompany company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Company not found: " + companyId));
        
        CustomerTeam.CustomerTeamBuilder teamBuilder = CustomerTeam.builder()
                .customerCompany(company)
                .name(dto.getName())
                .description(dto.getDescription())
                .costCenter(dto.getCostCenter())
                .serviceHours(dto.getServiceHours())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        if (dto.getParentTeamId() != null) {
            CustomerTeam parent = teamRepository.findById(dto.getParentTeamId())
                    .orElseThrow(() -> new RuntimeException("Parent team not found: " + dto.getParentTeamId()));
            teamBuilder.parentTeam(parent);
        }

        return convertToTeamDTO(teamRepository.save(teamBuilder.build()));
    }

    @Transactional
    public CustomerTeamDTO updateTeam(Long id, CustomerTeamDTO dto) {
        CustomerTeam team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Team not found: " + id));
        
        team.setName(dto.getName());
        team.setDescription(dto.getDescription());
        team.setCostCenter(dto.getCostCenter());
        team.setServiceHours(dto.getServiceHours());
        team.setStatus(dto.getStatus());

        if (dto.getParentTeamId() != null) {
            if (dto.getParentTeamId().equals(id)) {
                throw new RuntimeException("A team cannot be its own parent.");
            }
            CustomerTeam parent = teamRepository.findById(dto.getParentTeamId())
                    .orElseThrow(() -> new RuntimeException("Parent team not found: " + dto.getParentTeamId()));
            team.setParentTeam(parent);
        } else {
            team.setParentTeam(null);
        }

        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    // --- User Services ---
    public List<CustomerUserDTO> getUsersByTeam(Long teamId) {
        return userRepository.findByCustomerTeamId(teamId).stream()
                .map(this::convertToUserDTO)
                .collect(Collectors.toList());
    }

    public CustomerUserDTO getUser(Long id) {
        return userRepository.findById(id)
                .map(this::convertToUserDTO)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
    }

    @Transactional
    public CustomerUserDTO createUser(Long teamId, CustomerUserDTO dto) {
        CustomerTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found: " + teamId));
        
        CustomerUser user = CustomerUser.builder()
                .customerTeam(team)
                .userId(dto.getUserId())
                .name(dto.getName())
                .password(passwordEncoder.encode(dto.getPassword()))
                .email(dto.getEmail())
                .position(dto.getPosition())
                .role(dto.getRole() != null ? dto.getRole() : "ROLE_USER")
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .isVip(dto.getIsVip() != null ? dto.getIsVip() : false)
                .isApprover(dto.getIsApprover() != null ? dto.getIsApprover() : false)
                .userCriticality(dto.getUserCriticality())
                .build();

        return convertToUserDTO(userRepository.save(user));
    }

    @Transactional
    public CustomerUserDTO updateUser(Long id, CustomerUserDTO dto) {
        CustomerUser user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found: " + id));
        
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPosition(dto.getPosition());
        user.setIsActive(dto.getIsActive());
        user.setIsVip(dto.getIsVip());
        user.setIsApprover(dto.getIsApprover());
        user.setUserCriticality(dto.getUserCriticality());

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

    /**
     * Hierarchical Tree View Fetching.
     */
    public List<CustomerTeamDTO> getOrganizationTree(Long companyId) {
        List<CustomerTeam> allTeams = teamRepository.findByCustomerCompanyId(companyId);
        return allTeams.stream()
                .filter(t -> t.getParentTeam() == null)
                .map(this::convertToTeamDTO)
                .collect(Collectors.toList());
    }

    // --- Converters ---
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
                .createdBy(company.getCreatedBy())
                .updatedBy(company.getUpdatedBy())
                .build();
    }

    private CustomerTeamDTO convertToTeamDTO(CustomerTeam team) {
        CustomerTeamDTO.CustomerTeamDTOBuilder builder = CustomerTeamDTO.builder()
                .id(team.getId())
                .customerCompanyId(team.getCustomerCompany().getId())
                .customerCompanyName(team.getCustomerCompany().getName())
                .name(team.getName())
                .description(team.getDescription())
                .costCenter(team.getCostCenter())
                .serviceHours(team.getServiceHours())
                .status(team.getStatus())
                .createdAt(team.getCreatedAt())
                .updatedAt(team.getUpdatedAt())
                .createdBy(team.getCreatedBy())
                .updatedBy(team.getUpdatedBy());

        if (team.getParentTeam() != null) {
            builder.parentTeamId(team.getParentTeam().getId());
            builder.parentTeamName(team.getParentTeam().getName());
        }

        return builder.build();
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
                .position(user.getPosition())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .isVip(user.getIsVip())
                .isApprover(user.getIsApprover())
                .userCriticality(user.getUserCriticality())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .createdBy(user.getCreatedBy())
                .updatedBy(user.getUpdatedBy())
                .build();
    }
}

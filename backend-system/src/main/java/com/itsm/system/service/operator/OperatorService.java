package com.itsm.system.service.operator;

import com.itsm.system.domain.operator.Operator;
import com.itsm.system.domain.operator.OperatorCompany;
import com.itsm.system.domain.operator.OperatorTeam;
import com.itsm.system.domain.operator.mapping.OperatorTeamMember;
import com.itsm.system.dto.operator.OperatorCompanyDTO;
import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.dto.operator.OperatorTeamDTO;
import com.itsm.system.repository.operator.OperatorRepository;
import com.itsm.system.repository.operator.mapping.OperatorTeamMemberRepository;
import com.itsm.system.repository.operator.OperatorCompanyRepository;
import com.itsm.system.repository.operator.OperatorTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperatorService {

    private static final String SYSTEM_TENANT = "SYSTEM";

    private final OperatorCompanyRepository companyRepository;
    private final OperatorTeamRepository teamRepository;
    private final OperatorRepository operatorRepository;
    private final OperatorTeamMemberRepository teamMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.itsm.system.domain.code.CommonCodeRepository commonCodeRepository;
    private final jakarta.persistence.EntityManager entityManager;

    public List<OperatorCompanyDTO> getAllCompanies() {
        return companyRepository.findAll().stream()
                .map(this::convertToCompanyDTO)
                .collect(Collectors.toList());
    }

    public OperatorCompanyDTO getCompany(Long id) {
        return companyRepository.findById(id)
                .map(this::convertToCompanyDTO)
                .orElseThrow(() -> new RuntimeException("Operator company not found"));
    }

    @Transactional
    public OperatorCompanyDTO createCompany(OperatorCompanyDTO dto) {
        if (companyRepository.existsByOperatorCompanyId(dto.getOperatorCompanyId())) {
            throw new IllegalArgumentException("Operator Company ID already exists: " + dto.getOperatorCompanyId());
        }
        OperatorCompany company = OperatorCompany.builder()
                .operatorCompanyId(dto.getOperatorCompanyId())
                .name(dto.getName())
                .businessNumber(dto.getBusinessNumber())
                .representativeName(dto.getRepresentativeName())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();

        if (dto.getTenantId() != null && isAdminTenant()) {
            company.setTenantId(dto.getTenantId());
        }

        return convertToCompanyDTO(companyRepository.save(company));
    }

    @Transactional
    public OperatorCompanyDTO updateCompany(Long id, OperatorCompanyDTO dto) {
        OperatorCompany company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator company not found"));
        company.setName(dto.getName());
        company.setBusinessNumber(dto.getBusinessNumber());
        company.setRepresentativeName(dto.getRepresentativeName());
        company.setStatus(dto.getStatus());

        if (dto.getTenantId() != null && isAdminTenant()) {
            company.setTenantId(dto.getTenantId());
        }

        return convertToCompanyDTO(companyRepository.save(company));
    }

    @Transactional
    public void deleteCompany(Long id, boolean hardDelete) {
        // Cascade to teams
        teamRepository.findByOperatorCompany_Id(id).forEach(team -> {
            deleteTeam(team.getId(), hardDelete);
        });

        if (hardDelete && isAdminTenant()) {
            // Delete related contracts first
            entityManager.createNativeQuery("DELETE FROM msp_customer_contracts WHERE operator_company_id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            
            entityManager.flush();
            
            entityManager.createNativeQuery("DELETE FROM operator_companies WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            
            entityManager.clear();
        } else {
            companyRepository.deleteById(id);
        }
    }

    public List<OperatorTeamDTO> getTeamsByCompany(Long companyId) {
        return teamRepository.findByOperatorCompany_Id(companyId).stream()
                .map(this::convertToTeamDTO)
                .collect(Collectors.toList());
    }

    public OperatorTeamDTO getTeam(Long id) {
        return teamRepository.findById(id)
                .map(this::convertToTeamDTO)
                .orElseThrow(() -> new RuntimeException("Operator team not found"));
    }

    public OperatorDTO getOperator(Long id) {
        return operatorRepository.findById(id)
                .map(this::convertToOperatorDTO)
                .orElseThrow(() -> new RuntimeException("Operator not found"));
    }

    public List<OperatorTeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::convertToTeamDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OperatorTeamDTO createTeam(Long companyId, OperatorTeamDTO dto) {
        OperatorCompany company = companyRepository.findById(companyId)
                .orElseThrow(() -> new RuntimeException("Operator company not found"));
        OperatorTeam team = OperatorTeam.builder()
                .operatorCompany(company)
                .name(dto.getName())
                .description(dto.getDescription())
                .build();

        // Inherit or set tenantId
        if (dto.getTenantId() != null && isAdminTenant()) {
            team.setTenantId(dto.getTenantId());
        } else if (company.getTenantId() != null) {
            team.setTenantId(company.getTenantId());
        }

        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public OperatorTeamDTO updateTeam(Long id, OperatorTeamDTO dto) {
        OperatorTeam team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator team not found"));
        team.setName(dto.getName());
        team.setDescription(dto.getDescription());

        if (dto.getTenantId() != null && isAdminTenant()) {
            team.setTenantId(dto.getTenantId());
        }

        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(Long id, boolean hardDelete) {
        if (hardDelete && isAdminTenant()) {
            // Unlink members
            teamMemberRepository.deleteByOperatorTeamId(id);
            
            // Delete from team_customer_map
            entityManager.createNativeQuery("DELETE FROM team_customer_map WHERE operator_team_id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            
            entityManager.flush();
            
            entityManager.createNativeQuery("DELETE FROM operator_teams WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            
            entityManager.clear();
        } else {
            teamMemberRepository.deleteByOperatorTeamId(id);
            teamRepository.deleteById(id);
        }
    }

    public List<OperatorDTO> getOperatorsByTeam(Long teamId) {
        return teamMemberRepository.findByOperatorTeamId(teamId).stream()
                .map(tm -> convertToOperatorDTO(tm.getOperator()))
                .collect(Collectors.toList());
    }

    public List<OperatorDTO> getAllOperators() {
        return operatorRepository.findAll().stream()
                .map(this::convertToOperatorDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public OperatorDTO createOperator(Long teamId, OperatorDTO dto) {
        if (dto.getPassword() == null || dto.getPassword().isBlank()) {
            throw new IllegalArgumentException("Password is mandatory for new operator registration.");
        }
        
        if (operatorRepository.findByUserId(dto.getUserId()).isPresent()) {
            throw new IllegalArgumentException("User ID already exists: " + dto.getUserId());
        }
        
        // Validate Role
        String role = dto.getRole() != null ? dto.getRole() : "ROLE_OPER";
        validateRole(role);
        
        Operator operator = Operator.builder()
                .userId(dto.getUserId())
                .password(passwordEncoder.encode(dto.getPassword()))
                .name(dto.getName())
                .email(dto.getEmail())
                .role(role)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();

        // Link to team
        OperatorTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Inherit or set tenantId
        if (dto.getTenantId() != null && isAdminTenant()) {
            operator.setTenantId(dto.getTenantId());
        } else if (team.getOperatorCompany() != null && team.getOperatorCompany().getTenantId() != null) {
            operator.setTenantId(team.getOperatorCompany().getTenantId());
        }

        Operator saved = operatorRepository.save(operator);
        
        OperatorTeamMember member =
            OperatorTeamMember.builder()
                .operator(saved)
                .operatorTeam(team)
                .build();
        teamMemberRepository.save(member);
        
        return convertToOperatorDTO(saved);
    }

    @Transactional
    public OperatorDTO updateOperator(Long id, OperatorDTO dto) {
        Operator operator = operatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator not found"));
        
        if (dto.getRole() != null) {
            validateRole(dto.getRole());
            operator.setRole(dto.getRole());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            operator.setPassword(passwordEncoder.encode(dto.getPassword()));
        }
        
        operator.setName(dto.getName());
        operator.setEmail(dto.getEmail());
        operator.setIsActive(dto.getIsActive() != null ? dto.getIsActive() : operator.getIsActive());

        if (dto.getTenantId() != null && isAdminTenant()) {
            operator.setTenantId(dto.getTenantId());
        }
        
        return convertToOperatorDTO(operatorRepository.save(operator));
    }

    private void validateRole(String roleId) {
        if (!commonCodeRepository.existsByGroupIdAndCodeId("OPE_ROLE", roleId)) {
            throw new IllegalArgumentException("Invalid role code: " + roleId + ". It must exist in the OPE_ROLE group.");
        }
    }

    @Transactional
    public void deleteOperator(Long id, boolean hardDelete) {
        operatorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator not found"));

        // Get company ID to check if it's MSP
        String companyId = null;
        List<OperatorTeamMember> memberships = teamMemberRepository.findByOperatorId(id);
        if (!memberships.isEmpty()) {
            companyId = memberships.get(0).getOperatorTeam().getOperatorCompany().getOperatorCompanyId();
        }

        boolean isTargetMsp = "MSP".equals(companyId);
        boolean isCallerMsp = isAdminTenant();

        if (hardDelete && isTargetMsp && isCallerMsp) {
            // Unlink from teams first (physical delete mapping)
            teamMemberRepository.deleteByOperatorId(id);
            
            entityManager.flush();
            
            // Physical delete operator
            entityManager.createNativeQuery("DELETE FROM operators WHERE id = :id")
                    .setParameter("id", id)
                    .executeUpdate();
            
            entityManager.clear();
        } else {
            // Standard soft delete
            teamMemberRepository.deleteByOperatorId(id);
            operatorRepository.deleteById(id);
        }
    }

    @Transactional
    public void assignTeam(Long operatorId, Long teamId) {
        OperatorTeamMember.OperatorTeamMemberId id =
            new OperatorTeamMember.OperatorTeamMemberId(operatorId, teamId);
            
        if (teamMemberRepository.existsById(id)) {
            return; // Already mapped
        }

        Operator operator = operatorRepository.findById(operatorId)
                .orElseThrow(() -> new RuntimeException("Operator not found"));
        OperatorTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        OperatorTeamMember member =
            OperatorTeamMember.builder()
                .operator(operator)
                .operatorTeam(team)
                .build();
        teamMemberRepository.save(member);
    }

    @Transactional
    public void unassignTeam(Long operatorId, Long teamId) {
        OperatorTeamMember.OperatorTeamMemberId id =
            new OperatorTeamMember.OperatorTeamMemberId(operatorId, teamId);
        teamMemberRepository.deleteById(id);
    }

    private OperatorCompanyDTO convertToCompanyDTO(OperatorCompany company) {
        return OperatorCompanyDTO.builder()
                .id(company.getId())
                .operatorCompanyId(company.getOperatorCompanyId())
                .name(company.getName())
                .businessNumber(company.getBusinessNumber())
                .representativeName(company.getRepresentativeName())
                .status(company.getStatus())
                .teamCount((int) teamRepository.countByOperatorCompany_Id(company.getId()))
                .operatorCount((int) teamMemberRepository.countByCompanyId(company.getId()))
                .tenantId(company.getTenantId())
                .createdAt(company.getCreatedAt())
                .build();
    }

    private OperatorTeamDTO convertToTeamDTO(OperatorTeam team) {
        return OperatorTeamDTO.builder()
                .id(team.getId())
                .operatorCompanyId(team.getOperatorCompany().getId())
                .operatorCompanyName(team.getOperatorCompany().getName())
                .name(team.getName())
                .description(team.getDescription())
                .tenantId(team.getTenantId())
                .createdAt(team.getCreatedAt())
                .build();
    }

    private OperatorDTO convertToOperatorDTO(Operator operator) {
        // Fetch teams for this operator
        List<OperatorTeamDTO> teams = teamMemberRepository.findByOperatorId(operator.getId())
                .stream()
                .map(tm -> convertToTeamDTO(tm.getOperatorTeam()))
                .collect(Collectors.toList());

        return OperatorDTO.builder()
                .id(operator.getId())
                .userId(operator.getUserId())
                .name(operator.getName())
                .email(operator.getEmail())
                .role(operator.getRole())
                .isActive(operator.getIsActive())
                .tenantId(operator.getTenantId())
                .createdAt(operator.getCreatedAt())
                .teams(teams)
                .build();
    }

    private boolean isAdminTenant() {
        String tenantId = com.itsm.system.security.TenantContext.getTenantId();
        return com.itsm.system.security.TenantContext.DEFAULT_TENANT.equals(tenantId) 
                || SYSTEM_TENANT.equals(tenantId);
    }
}

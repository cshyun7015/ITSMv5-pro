package com.itsm.system.service.organization.operator;

import com.itsm.system.domain.organization.operator.Operator;
import com.itsm.system.domain.organization.operator.OperatorCompany;
import com.itsm.system.domain.organization.operator.OperatorTeam;
import com.itsm.system.dto.organization.operator.OperatorCompanyDTO;
import com.itsm.system.dto.organization.operator.OperatorDTO;
import com.itsm.system.dto.organization.operator.OperatorTeamDTO;
import com.itsm.system.repository.organization.mapping.OperatorTeamMemberRepository;
import com.itsm.system.repository.organization.operator.OperatorCompanyRepository;
import com.itsm.system.repository.organization.operator.OperatorRepository;
import com.itsm.system.repository.organization.operator.OperatorTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OperatorService {

    private final OperatorCompanyRepository companyRepository;
    private final OperatorTeamRepository teamRepository;
    private final OperatorRepository operatorRepository;
    private final OperatorTeamMemberRepository teamMemberRepository;

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
        OperatorCompany company = OperatorCompany.builder()
                .operatorCompanyId(dto.getOperatorCompanyId())
                .name(dto.getName())
                .businessNumber(dto.getBusinessNumber())
                .status(dto.getStatus() != null ? dto.getStatus() : "ACTIVE")
                .build();
        return convertToCompanyDTO(companyRepository.save(company));
    }

    @Transactional
    public OperatorCompanyDTO updateCompany(Long id, OperatorCompanyDTO dto) {
        OperatorCompany company = companyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator company not found"));
        company.setName(dto.getName());
        company.setBusinessNumber(dto.getBusinessNumber());
        company.setStatus(dto.getStatus());
        return convertToCompanyDTO(companyRepository.save(company));
    }

    @Transactional
    public void deleteCompany(Long id) {
        companyRepository.deleteById(id);
    }

    public List<OperatorTeamDTO> getTeamsByCompany(Long companyId) {
        return teamRepository.findByOperatorCompanyId(companyId).stream()
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
        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public OperatorTeamDTO updateTeam(Long id, OperatorTeamDTO dto) {
        OperatorTeam team = teamRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operator team not found"));
        team.setName(dto.getName());
        team.setDescription(dto.getDescription());
        return convertToTeamDTO(teamRepository.save(team));
    }

    @Transactional
    public void deleteTeam(Long id) {
        teamRepository.deleteById(id);
    }

    public List<OperatorDTO> getOperatorsByTeam(Long teamId) {
        return teamMemberRepository.findByOperatorTeamId(teamId).stream()
                .map(tm -> convertToOperatorDTO(tm.getOperator()))
                .collect(Collectors.toList());
    }

    @Transactional
    public OperatorDTO createOperator(Long teamId, OperatorDTO dto) {
        Operator operator = Operator.builder()
                .userId(dto.getUserId())
                .name(dto.getName())
                .email(dto.getEmail())
                .role(dto.getRole())
                .isActive(true)
                .build();
        Operator saved = operatorRepository.save(operator);
        
        // Link to team
        OperatorTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        com.itsm.system.domain.organization.mapping.OperatorTeamMember member = 
            com.itsm.system.domain.organization.mapping.OperatorTeamMember.builder()
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
        operator.setName(dto.getName());
        operator.setEmail(dto.getEmail());
        operator.setRole(dto.getRole());
        return convertToOperatorDTO(operatorRepository.save(operator));
    }

    @Transactional
    public void deleteOperator(Long id) {
        operatorRepository.deleteById(id);
    }

    private OperatorCompanyDTO convertToCompanyDTO(OperatorCompany company) {
        return OperatorCompanyDTO.builder()
                .id(company.getId())
                .operatorCompanyId(company.getOperatorCompanyId())
                .name(company.getName())
                .businessNumber(company.getBusinessNumber())
                .status(company.getStatus())
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
                .createdAt(operator.getCreatedAt())
                .teams(teams)
                .build();
    }
}

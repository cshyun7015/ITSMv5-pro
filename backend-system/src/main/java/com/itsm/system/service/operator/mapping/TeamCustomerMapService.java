package com.itsm.system.service.operator.mapping;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.mapping.TeamCustomerMap;
import com.itsm.system.domain.organization.mapping.TeamCustomerMap.TeamCustomerMapId;
import com.itsm.system.domain.organization.operator.OperatorTeam;
import com.itsm.system.dto.organization.mapping.TeamCustomerMapDTO;
import com.itsm.system.repository.customer.CustomerCompanyRepository;
import com.itsm.system.repository.operator.mapping.TeamCustomerMapRepository;
import com.itsm.system.repository.operator.OperatorTeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamCustomerMapService {

    private final TeamCustomerMapRepository repository;
    private final OperatorTeamRepository teamRepository;
    private final CustomerCompanyRepository customerRepository;

    @Transactional(readOnly = true)
    public List<TeamCustomerMapDTO> getAllMappings() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamCustomerMapDTO> getMappingsByTeam(Long teamId) {
        return repository.findByOperatorTeamId(teamId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamCustomerMapDTO> getMappingsByCustomer(Long customerId) {
        return repository.findByCustomerCompanyId(customerId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamCustomerMapDTO assignTeamToCustomer(Long teamId, Long customerId) {
        TeamCustomerMapId mappingId = new TeamCustomerMapId(teamId, customerId);
        if (repository.existsById(mappingId)) {
            return convertToDTO(repository.getReferenceById(mappingId));
        }

        OperatorTeam team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Operator Team not found"));
        CustomerCompany customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer Company not found"));

        TeamCustomerMap map = TeamCustomerMap.builder()
                .id(mappingId)
                .operatorTeam(team)
                .customerCompany(customer)
                .build();

        return convertToDTO(repository.save(map));
    }

    @Transactional
    public void unassignTeamFromCustomer(Long teamId, Long customerId) {
        TeamCustomerMapId id = new TeamCustomerMapId(teamId, customerId);
        if (!repository.existsById(id)) {
            throw new RuntimeException("Mapping not found");
        }
        repository.deleteById(id);
    }

    private TeamCustomerMapDTO convertToDTO(TeamCustomerMap map) {
        return TeamCustomerMapDTO.builder()
                .operatorTeamId(map.getOperatorTeam().getId())
                .operatorTeamName(map.getOperatorTeam().getName())
                .customerCompanyId(map.getCustomerCompany().getId())
                .customerCompanyName(map.getCustomerCompany().getName())
                .build();
    }
}

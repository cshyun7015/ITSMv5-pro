package com.itsm.system.service.code;

import com.itsm.system.domain.code.CodeGroup;
import com.itsm.system.domain.code.CodeGroupRepository;
import com.itsm.system.domain.code.CommonCode;
import com.itsm.system.domain.code.CommonCodeRepository;
import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import com.itsm.system.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommonCodeServiceImpl implements CommonCodeService {

    private final CodeGroupRepository groupRepository;
    private final CommonCodeRepository codeRepository;

    // --- Group Operations ---

    @Override
    @Transactional(readOnly = true)
    public List<CodeGroupDTO> getAllGroups() {
        return groupRepository.findAll().stream()
                .map(this::convertToGroupDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CodeGroupDTO getGroup(String groupId) {
        CodeGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException("Code Group not found: " + groupId, HttpStatus.NOT_FOUND));
        return convertToGroupDTO(group);
    }

    @Override
    @Transactional
    public CodeGroupDTO createGroup(CodeGroupDTO dto) {
        if (groupRepository.existsById(dto.getGroupId())) {
            throw new BusinessException("Group ID already exists: " + dto.getGroupId(), HttpStatus.CONFLICT);
        }
        CodeGroup group = CodeGroup.builder()
                .groupId(dto.getGroupId())
                .name(dto.getName())
                .description(dto.getDescription())
                .isSystem(dto.getIsSystem() != null ? dto.getIsSystem() : false)
                .build();
        return convertToGroupDTO(groupRepository.save(group));
    }

    @Override
    @Transactional
    public CodeGroupDTO updateGroup(String groupId, CodeGroupDTO dto) {
        CodeGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException("Code Group not found: " + groupId, HttpStatus.NOT_FOUND));
        
        group.setName(dto.getName());
        group.setDescription(dto.getDescription());
        group.setIsSystem(dto.getIsSystem() != null ? dto.getIsSystem() : group.getIsSystem());

        return convertToGroupDTO(groupRepository.save(group));
    }

    @Override
    @Transactional
    public void deleteGroup(String groupId) {
        CodeGroup group = groupRepository.findById(groupId)
                .orElseThrow(() -> new BusinessException("Code Group not found: " + groupId, HttpStatus.NOT_FOUND));
        
        if (Boolean.TRUE.equals(group.getIsSystem())) {
            throw new BusinessException("System group cannot be deleted: " + groupId, HttpStatus.FORBIDDEN);
        }
        groupRepository.deleteById(groupId);
    }

    // --- Code Operations ---

    @Override
    @Transactional(readOnly = true)
    public List<CommonCodeDTO> getCodesByGroup(String groupId) {
        return codeRepository.findByGroupIdOrderBySortOrderAsc(groupId).stream()
                .map(this::convertToCodeDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public CommonCodeDTO createCode(CommonCodeDTO dto) {
        if (codeRepository.existsByGroupIdAndCodeId(dto.getGroupId(), dto.getCodeId())) {
            throw new BusinessException("Code ID " + dto.getCodeId() + " already exists in group " + dto.getGroupId(), HttpStatus.CONFLICT);
        }

        CommonCode code = CommonCode.builder()
                .groupId(dto.getGroupId())
                .codeId(dto.getCodeId())
                .codeName(dto.getCodeName())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder() != null ? dto.getSortOrder() : 0)
                .isActive(dto.getIsActive() != null ? dto.getIsActive() : true)
                .build();
        
        return convertToCodeDTO(codeRepository.save(code));
    }

    @Override
    @Transactional
    public CommonCodeDTO updateCode(Long id, CommonCodeDTO dto) {
        CommonCode code = codeRepository.findById(id)
                .orElseThrow(() -> new BusinessException("Code not found with id: " + id, HttpStatus.NOT_FOUND));

        code.setCodeName(dto.getCodeName());
        code.setDescription(dto.getDescription());
        code.setSortOrder(dto.getSortOrder());
        code.setIsActive(dto.getIsActive());

        return convertToCodeDTO(codeRepository.save(code));
    }

    @Override
    @Transactional
    public void deleteCode(Long id) {
        if (!codeRepository.existsById(id)) {
            throw new BusinessException("Code not found with id: " + id, HttpStatus.NOT_FOUND);
        }
        codeRepository.deleteById(id);
    }

    // --- Helpers ---

    private CodeGroupDTO convertToGroupDTO(CodeGroup group) {
        return CodeGroupDTO.builder()
                .groupId(group.getGroupId())
                .name(group.getName())
                .description(group.getDescription())
                .isSystem(group.getIsSystem())
                .createdAt(group.getCreatedAt())
                .updatedAt(group.getUpdatedAt())
                .build();
    }

    private CommonCodeDTO convertToCodeDTO(CommonCode code) {
        return CommonCodeDTO.builder()
                .id(code.getId())
                .groupId(code.getGroupId())
                .codeId(code.getCodeId())
                .codeName(code.getCodeName())
                .description(code.getDescription())
                .sortOrder(code.getSortOrder())
                .isActive(code.getIsActive())
                .createdAt(code.getCreatedAt())
                .updatedAt(code.getUpdatedAt())
                .build();
    }
}

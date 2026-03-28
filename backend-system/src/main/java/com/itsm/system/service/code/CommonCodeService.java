package com.itsm.system.service.code;

import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;

import java.util.List;

public interface CommonCodeService {
    // Group Operations
    List<CodeGroupDTO> getAllGroups();
    CodeGroupDTO getGroup(String groupId);
    CodeGroupDTO createGroup(CodeGroupDTO dto);
    CodeGroupDTO updateGroup(String groupId, CodeGroupDTO dto);
    void deleteGroup(String groupId);

    // Code Operations
    List<CommonCodeDTO> getCodesByGroup(String groupId);
    CommonCodeDTO createCode(CommonCodeDTO dto);
    CommonCodeDTO updateCode(Long id, CommonCodeDTO dto);
    void deleteCode(Long id);
}

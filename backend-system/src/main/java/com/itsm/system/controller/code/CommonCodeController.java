package com.itsm.system.controller.code;

import com.itsm.system.domain.common.ApiResponse;
import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import com.itsm.system.service.code.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/system/codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    // --- Group Endpoints ---
    @GetMapping("/groups")
    public ApiResponse<List<CodeGroupDTO>> getAllGroups() {
        return ApiResponse.success(commonCodeService.getAllGroups());
    }

    @GetMapping("/groups/{groupId}")
    public ApiResponse<CodeGroupDTO> getGroup(@PathVariable String groupId) {
        return ApiResponse.success(commonCodeService.getGroup(groupId));
    }

    @PostMapping("/groups")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CodeGroupDTO> createGroup(@RequestBody CodeGroupDTO dto) {
        return ApiResponse.success(commonCodeService.createGroup(dto));
    }

    @PutMapping("/groups/{groupId}")
    public ApiResponse<CodeGroupDTO> updateGroup(@PathVariable String groupId, @RequestBody CodeGroupDTO dto) {
        return ApiResponse.success(commonCodeService.updateGroup(groupId, dto));
    }

    @DeleteMapping("/groups/{groupId}")
    public ApiResponse<Void> deleteGroup(@PathVariable String groupId) {
        commonCodeService.deleteGroup(groupId);
        return ApiResponse.success(null);
    }

    // --- Code Endpoints ---
    @GetMapping("/groups/{groupId}/items")
    public ApiResponse<List<CommonCodeDTO>> getCodesByGroup(@PathVariable String groupId) {
        return ApiResponse.success(commonCodeService.getCodesByGroup(groupId));
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<CommonCodeDTO> createCode(@RequestBody CommonCodeDTO dto) {
        return ApiResponse.success(commonCodeService.createCode(dto));
    }

    @PutMapping("/items/{id}")
    public ApiResponse<CommonCodeDTO> updateCode(@PathVariable Long id, @RequestBody CommonCodeDTO dto) {
        return ApiResponse.success(commonCodeService.updateCode(id, dto));
    }

    @DeleteMapping("/items/{id}")
    public ApiResponse<Void> deleteCode(@PathVariable Long id) {
        commonCodeService.deleteCode(id);
        return ApiResponse.success(null);
    }
}

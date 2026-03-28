package com.itsm.system.controller.code;

import com.itsm.system.dto.code.CodeGroupDTO;
import com.itsm.system.dto.code.CommonCodeDTO;
import com.itsm.system.service.code.CommonCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/codes")
@RequiredArgsConstructor
public class CommonCodeController {

    private final CommonCodeService commonCodeService;

    // --- Group Endpoints ---

    @GetMapping("/groups")
    public List<CodeGroupDTO> getAllGroups() {
        return commonCodeService.getAllGroups();
    }

    @GetMapping("/groups/{groupId}")
    public CodeGroupDTO getGroup(@PathVariable String groupId) {
        return commonCodeService.getGroup(groupId);
    }

    @PostMapping("/groups")
    public ResponseEntity<CodeGroupDTO> createGroup(@RequestBody CodeGroupDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commonCodeService.createGroup(dto));
    }

    @PutMapping("/groups/{groupId}")
    public CodeGroupDTO updateGroup(@PathVariable String groupId, @RequestBody CodeGroupDTO dto) {
        return commonCodeService.updateGroup(groupId, dto);
    }

    @DeleteMapping("/groups/{groupId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteGroup(@PathVariable String groupId) {
        commonCodeService.deleteGroup(groupId);
    }

    // --- Code Endpoints ---

    @GetMapping("/groups/{groupId}/items")
    public List<CommonCodeDTO> getCodesByGroup(@PathVariable String groupId) {
        return commonCodeService.getCodesByGroup(groupId);
    }

    @PostMapping("/items")
    public ResponseEntity<CommonCodeDTO> createCode(@RequestBody CommonCodeDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(commonCodeService.createCode(dto));
    }

    @PutMapping("/items/{id}")
    public CommonCodeDTO updateCode(@PathVariable Long id, @RequestBody CommonCodeDTO dto) {
        return commonCodeService.updateCode(id, dto);
    }

    @DeleteMapping("/items/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCode(@PathVariable Long id) {
        commonCodeService.deleteCode(id);
    }
}

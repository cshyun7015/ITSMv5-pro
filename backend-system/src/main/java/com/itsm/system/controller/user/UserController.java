package com.itsm.system.controller.user;

import com.itsm.system.dto.user.UserRequestDTO;
import com.itsm.system.dto.user.UserResponseDTO;
import com.itsm.system.service.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/system/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(
            @RequestHeader(value = "X-Company-ID", required = false) String headerCompanyId,
            @RequestBody UserRequestDTO dto) {
        // Enforce X-Company-ID in isolation context
        if (headerCompanyId != null && (dto.getCompanyId() == null || dto.getCompanyId().isEmpty())) {
            dto.setCompanyId(headerCompanyId);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUser(id));
    }

    @GetMapping("/id/{userId}")
    public ResponseEntity<UserResponseDTO> getUserByUserId(@PathVariable String userId) {
        return ResponseEntity.ok(userService.getUserByUserId(userId));
    }

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getUsersByCompany(
            @RequestHeader("X-Company-ID") String headerCompanyId,
            @RequestParam(required = false) String companyId) {
        String targetCompanyId = (companyId != null && !companyId.isEmpty()) ? companyId : headerCompanyId;
        return ResponseEntity.ok(userService.getUsersByCompany(targetCompanyId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserResponseDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UserRequestDTO dto) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}

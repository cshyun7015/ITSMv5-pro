package com.itsm.system.service.user;

import com.itsm.system.dto.user.UserRequestDTO;
import com.itsm.system.dto.user.UserResponseDTO;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface UserService {
    UserResponseDTO createUser(UserRequestDTO dto);
    UserResponseDTO getUser(Long id);
    UserResponseDTO getUserByUserId(String userId);
    List<UserResponseDTO> getUsersByCompany(String companyId);
    List<UserResponseDTO> getAllUsers();
    Page<UserResponseDTO> searchUsers(String companyId, String name, String role, Boolean isActive, Pageable pageable);
    UserResponseDTO updateUser(Long id, UserRequestDTO dto);
    void deleteUser(Long id);
}

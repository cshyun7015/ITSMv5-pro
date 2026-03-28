package com.itsm.system.service.user;

import com.itsm.system.dto.user.UserRequestDTO;
import com.itsm.system.dto.user.UserResponseDTO;

import java.util.List;

public interface UserService {
    UserResponseDTO createUser(UserRequestDTO dto);
    UserResponseDTO getUser(Long id);
    UserResponseDTO getUserByUserId(String userId);
    List<UserResponseDTO> getUsersByCompany(String companyId);
    UserResponseDTO updateUser(Long id, UserRequestDTO dto);
    void deleteUser(Long id);
}

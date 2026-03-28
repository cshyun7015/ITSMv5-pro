package com.itsm.system.service.auth;

import com.itsm.system.domain.user.User;
import com.itsm.system.domain.user.UserRepository;
import com.itsm.system.dto.auth.LoginRequest;
import com.itsm.system.dto.auth.SignupRequest;
import com.itsm.system.dto.auth.AuthResponse;
import com.itsm.system.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
        );

        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        return AuthResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .role(user.getRole())
                .companyId(user.getCompanyId())
                .build();
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User ID already exists");
        }

        User user = User.builder()
                .userId(request.getUserId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .companyId(request.getCompanyId())
                .role("ROLE_USER") // Default role for signup
                .isActive(true)
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .role(user.getRole())
                .companyId(user.getCompanyId())
                .build();
    }

    public String createToken(AuthResponse response) {
        return tokenProvider.generateToken(
                response.getUserId(),
                response.getName(),
                response.getRole(),
                response.getCompanyId()
        );
    }
}

package com.itsm.system.service.auth;

import com.itsm.system.domain.organization.customer.CustomerCompany;
import com.itsm.system.domain.organization.customer.CustomerTeam;
import com.itsm.system.domain.organization.customer.CustomerUser;
import com.itsm.system.domain.organization.operator.Operator;
import com.itsm.system.repository.organization.customer.CustomerCompanyRepository;
import com.itsm.system.repository.organization.customer.CustomerTeamRepository;
import com.itsm.system.repository.organization.customer.CustomerUserRepository;
import com.itsm.system.repository.organization.operator.OperatorCompanyRepository;
import com.itsm.system.repository.organization.operator.OperatorRepository;
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
    private final OperatorRepository operatorRepository;
    private final CustomerUserRepository customerUserRepository;
    private final CustomerTeamRepository customerTeamRepository;
    private final OperatorCompanyRepository operatorCompanyRepository;
    private final CustomerCompanyRepository customerCompanyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
        );

        // Try Operator first
        return operatorRepository.findByUserId(request.getUserId())
                .map(this::mapOperatorToAuthResponse)
                .orElseGet(() -> customerUserRepository.findByUserId(request.getUserId())
                        .map(this::mapCustomerToAuthResponse)
                        .orElseThrow(() -> new RuntimeException("User not found")));
    }

    private AuthResponse mapOperatorToAuthResponse(Operator operator) {
        // Operators are linked to OperatorCompanies via OperatorTeams
        // For simplicity in login response, we'll try to find their primary company ID
        // Note: Actual company mapping might need more complex logic if they belong to multiple
        return AuthResponse.builder()
                .userId(operator.getUserId())
                .name(operator.getName())
                .role(operator.getRole())
                .companyId("MSP") // Placeholder or lookup
                .companyName("Management Service Provider")
                .build();
    }

    private AuthResponse mapCustomerToAuthResponse(CustomerUser customerUser) {
        CustomerCompany company = customerUser.getCustomerTeam().getCustomerCompany();
        return AuthResponse.builder()
                .userId(customerUser.getUserId())
                .name(customerUser.getName())
                .role(customerUser.getRole())
                .companyId(company.getCustomerId())
                .companyName(company.getName())
                .build();
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (customerUserRepository.existsByUserId(request.getUserId()) || operatorRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User ID already exists");
        }

        // Default signup as Customer User
        CustomerCompany company = customerCompanyRepository.findByCustomerId(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Company not found"));
        
        // Find '기본팀' for the company (created by migration/initialization)
        CustomerTeam defaultTeam = customerTeamRepository.findByCustomerCompanyId(company.getId())
                .stream()
                .filter(t -> t.getName().equals("기본팀"))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Default team not found for company"));

        CustomerUser user = CustomerUser.builder()
                .userId(request.getUserId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .customerTeam(defaultTeam)
                .role("ROLE_USER")
                .isActive(true)
                .build();

        customerUserRepository.save(user);

        return AuthResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .role(user.getRole())
                .companyId(company.getCustomerId())
                .companyName(company.getName())
                .build();
    }

    public String createToken(AuthResponse response) {
        return tokenProvider.generateToken(
                response.getUserId(),
                response.getName(),
                response.getRole(),
                response.getCompanyId(),
                response.getCompanyName()
        );
    }
}

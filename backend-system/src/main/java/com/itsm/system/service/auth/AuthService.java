package com.itsm.system.service.auth;

import com.itsm.system.domain.operator.mapping.OperatorTeamMember;
import com.itsm.system.domain.customer.CustomerCompany;
import com.itsm.system.domain.customer.CustomerTeam;
import com.itsm.system.domain.customer.CustomerUser;
import com.itsm.system.domain.operator.Operator;
import com.itsm.system.repository.customer.CustomerCompanyRepository;
import com.itsm.system.repository.customer.CustomerTeamRepository;
import com.itsm.system.repository.customer.CustomerUserRepository;
import com.itsm.system.repository.operator.OperatorRepository;
import com.itsm.system.dto.auth.LoginRequest;
import com.itsm.system.dto.auth.SignupRequest;
import com.itsm.system.dto.auth.AuthResponse;
import com.itsm.system.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
@Slf4j
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final OperatorRepository operatorRepository;
    private final CustomerUserRepository customerUserRepository;
    private final CustomerTeamRepository customerTeamRepository;
    private final CustomerCompanyRepository customerCompanyRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final com.itsm.system.repository.operator.mapping.OperatorTeamMemberRepository operatorTeamMemberRepository;
    private final com.itsm.system.repository.operator.OperatorCompanyRepository operatorCompanyRepository;
    private final com.itsm.system.repository.operator.OperatorTeamRepository operatorTeamRepository;
    private final jakarta.persistence.EntityManager entityManager;

    public AuthResponse login(LoginRequest request) {
        log.debug("Login attempt for User: {}, Tenant Header: {}", request.getUserId(), com.itsm.system.security.TenantContext.getTenantId());
        
        // During login, we should be able to find the user and their related company/team data 
        // regardless of the current session's tenant filter, which might be stale or incorrect.
        org.hibernate.Session session = entityManager.unwrap(org.hibernate.Session.class);
        session.disableFilter("tenantFilter");

        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUserId(), request.getPassword())
            );
            log.info("Authentication successful for user: {}", request.getUserId());
        } catch (BadCredentialsException e) {
            log.warn("Authentication failed for user: {} - Invalid credentials", request.getUserId());
            throw new BadCredentialsException("아이디 또는 비밀번호가 일치하지 않습니다.");
        } catch (org.springframework.security.authentication.DisabledException e) {
            log.warn("Authentication failed for user: {} - Account disabled", request.getUserId());
            throw e;
        } catch (Exception e) {
            log.error("Authentication error for user: {}", request.getUserId(), e);
            throw new BadCredentialsException("로그인 처리 중 오류가 발생했습니다.");
        }

        return getUserProfile(request.getUserId());
    }

    public AuthResponse getUserProfile(String userId) {
        log.debug("Fetching profile for user: {}", userId);
        // Try Operator first
        return operatorRepository.findByUserId(userId)
                .map(this::mapOperatorToAuthResponse)
                .orElseGet(() -> customerUserRepository.findByUserId(userId)
                        .map(this::mapCustomerToAuthResponse)
                        .orElseThrow(() -> {
                            log.error("User profile not found after authentication: {}", userId);
                            return new BadCredentialsException("User profile not found");
                        }));
    }

    private AuthResponse mapOperatorToAuthResponse(Operator operator) {
        if (Boolean.TRUE.equals(operator.getIsDeleted())) {
            throw new BadCredentialsException("Account is deleted");
        }
        if (!Boolean.TRUE.equals(operator.getIsActive())) {
            throw new BadCredentialsException("Account is inactive");
        }

        // Find primary company from team membership
        var memberships = operatorTeamMemberRepository.findByOperatorId(operator.getId());
        
        String companyId = "MSP";
        String companyName = "Management Service Provider";
        boolean isSuper = false;

        if (!memberships.isEmpty()) {
            var company = memberships.get(0).getOperatorTeam().getOperatorCompany();
            companyId = company.getOperatorCompanyId();
            companyName = company.getName();
            isSuper = Boolean.TRUE.equals(company.getIsSuperCompany());
        }

        return AuthResponse.builder()
                .userId(operator.getUserId())
                .name(operator.getName())
                .role(operator.getRole())
                .companyId(companyId)
                .companyName(companyName)
                .isSuperCompany(isSuper)
                .build();
    }

    private AuthResponse mapCustomerToAuthResponse(CustomerUser customerUser) {
        if (Boolean.TRUE.equals(customerUser.getIsDeleted())) {
            throw new BadCredentialsException("Account is deleted");
        }
        if (!Boolean.TRUE.equals(customerUser.getIsActive())) {
            throw new BadCredentialsException("Account is inactive");
        }

        if (customerUser.getCustomerTeam() == null || customerUser.getCustomerTeam().getCustomerCompany() == null) {
            log.error("Customer user {} does not have associated team or company", customerUser.getUserId());
            throw new BadCredentialsException("사용자의 팀 또는 회사 정보가 설정되지 않았습니다.");
        }

        CustomerCompany company = customerUser.getCustomerTeam().getCustomerCompany();
        return AuthResponse.builder()
                .userId(customerUser.getUserId())
                .name(customerUser.getName())
                .role(customerUser.getRole())
                .companyId(company.getCustomerId())
                .companyName(company.getName())
                .isSuperCompany(false)
                .build();
    }

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (customerUserRepository.existsByUserId(request.getUserId()) || operatorRepository.existsByUserId(request.getUserId())) {
            throw new RuntimeException("User ID already exists");
        }

        if ("OPERATOR".equalsIgnoreCase(request.getType())) {
            return signupOperator(request);
        } else {
            return signupCustomer(request);
        }
    }

    private AuthResponse signupOperator(SignupRequest request) {
        var company = operatorCompanyRepository.findByOperatorCompanyId(request.getCompanyId())
                .orElseThrow(() -> new RuntimeException("Operator Company not found"));

        var team = (request.getTeamId() != null)
                ? operatorTeamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new RuntimeException("Team not found"))
                : operatorTeamRepository.findByOperatorCompany_Id(company.getId()).stream()
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("No teams found for this company"));

        Operator operator = Operator.builder()
                .userId(request.getUserId())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .email(request.getEmail())
                .role("ROLE_OPER")
                .isActive(true)
                .build();

        operatorRepository.save(operator);

        var membership = OperatorTeamMember.builder()
                .operator(operator)
                .operatorTeam(team)
                .build();
        operatorTeamMemberRepository.save(membership);

        return AuthResponse.builder()
                .userId(operator.getUserId())
                .name(operator.getName())
                .role(operator.getRole())
                .companyId(company.getOperatorCompanyId())
                .companyName(company.getName())
                .build();
    }

    private AuthResponse signupCustomer(SignupRequest request) {
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

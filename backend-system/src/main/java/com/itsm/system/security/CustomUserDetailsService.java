package com.itsm.system.security;

import com.itsm.system.domain.customer.CustomerUser;
import com.itsm.system.domain.operator.Operator;
import com.itsm.system.repository.customer.CustomerUserRepository;
import com.itsm.system.repository.operator.OperatorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import jakarta.persistence.EntityManager;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class CustomUserDetailsService implements UserDetailsService {

    private final OperatorRepository operatorRepository;
    private final CustomerUserRepository customerUserRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        log.debug("Authenticating user: {}, Current Tenant: {}", userId, TenantContext.getTenantId());

        // During login, we bypass the tenant filter to find the user globally first.
        // This helps us distinguish between "user not found" and "user in wrong tenant".
        Session session = entityManager.unwrap(Session.class);
        session.disableFilter("tenantFilter");

        // 1. Try finding in operators (Priority)
        return operatorRepository.findByUserId(userId)
                .map(operator -> {
                    log.debug("Found Operator: {} (Tenant: {})", operator.getUserId(), operator.getTenantId());
                    return createSpringUser(operator);
                })
                .orElseGet(() -> customerUserRepository.findByUserId(userId)
                        .map(customerUser -> {
                            log.debug("Found CustomerUser: {} (Tenant: {})", customerUser.getUserId(), customerUser.getTenantId());
                            return createSpringUser(customerUser);
                        })
                        .orElseThrow(() -> {
                            log.warn("User not found globally: {}", userId);
                            return new UsernameNotFoundException("User not found with id: " + userId);
                        }));
    }

    private org.springframework.security.core.userdetails.User createSpringUser(Operator operator) {
        return new org.springframework.security.core.userdetails.User(
                operator.getUserId(),
                operator.getPassword(),
                !Boolean.FALSE.equals(operator.getIsActive()), // Treat null as true
                true, true, true,
                List.of(new SimpleGrantedAuthority(operator.getRole()))
        );
    }

    private org.springframework.security.core.userdetails.User createSpringUser(CustomerUser customerUser) {
        return new org.springframework.security.core.userdetails.User(
                customerUser.getUserId(),
                customerUser.getPassword(),
                !Boolean.FALSE.equals(customerUser.getIsActive()), // Treat null as true
                true, true, true,
                List.of(new SimpleGrantedAuthority(customerUser.getRole()))
        );
    }
}

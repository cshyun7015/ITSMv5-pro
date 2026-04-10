package com.itsm.system.security;

import com.itsm.system.domain.organization.customer.CustomerUser;
import com.itsm.system.domain.organization.operator.Operator;
import com.itsm.system.repository.customer.CustomerUserRepository;
import com.itsm.system.repository.operator.OperatorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final OperatorRepository operatorRepository;
    private final CustomerUserRepository customerUserRepository;

    @Override
    public UserDetails loadUserByUsername(String userId) throws UsernameNotFoundException {
        // 1. Try finding in operators (Priority)
        return operatorRepository.findByUserId(userId)
                .map(this::createSpringUser)
                .orElseGet(() -> customerUserRepository.findByUserId(userId)
                        .map(this::createSpringUser)
                        .orElseThrow(() -> new UsernameNotFoundException("User not found with id: " + userId)));
    }

    private org.springframework.security.core.userdetails.User createSpringUser(Operator operator) {
        return new org.springframework.security.core.userdetails.User(
                operator.getUserId(),
                operator.getPassword(),
                Boolean.TRUE.equals(operator.getIsActive()),
                true, true, true,
                List.of(new SimpleGrantedAuthority(operator.getRole()))
        );
    }

    private org.springframework.security.core.userdetails.User createSpringUser(CustomerUser customerUser) {
        return new org.springframework.security.core.userdetails.User(
                customerUser.getUserId(),
                customerUser.getPassword(),
                Boolean.TRUE.equals(customerUser.getIsActive()),
                true, true, true,
                List.of(new SimpleGrantedAuthority(customerUser.getRole()))
        );
    }
}

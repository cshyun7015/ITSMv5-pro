package com.itsm.dashboard.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getServletPath();
        return path.startsWith("/actuator") || path.startsWith("/error");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        log.trace("Dashboard Filter processing request: {} {}", request.getMethod(), request.getServletPath());
        
        // Debug headers
        if (log.isTraceEnabled()) {
            java.util.Collections.list(request.getHeaderNames()).forEach(h -> 
                log.trace("Header: {} = {}", h, request.getHeader(h)));
        }

        String token = tokenProvider.resolveToken(request);

        if (token != null && tokenProvider.validateToken(token)) {
            try {
                String userId = tokenProvider.getUserId(token);
                Claims claims = tokenProvider.getClaims(token);
                String role = claims.get("role", String.class);
                String companyId = claims.get("companyId", String.class);

                log.info("Dashboard Auth Success: user={}, role={}, company={}", userId, role, companyId);

                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        userId, null, List.of(new SimpleGrantedAuthority(role)));
                
                request.setAttribute("companyId", companyId);
                request.setAttribute("userRole", role);
                request.setAttribute("jwtToken", token);
                
                SecurityContextHolder.getContext().setAuthentication(auth);
            } catch (Exception e) {
                log.error("Dashboard Auth Error during claim extraction: {}", e.getMessage());
            }
        } else {
            if (token == null) {
                log.warn("Dashboard Auth Failed: No ITSMSession cookie found in request from {}", request.getRemoteAddr());
            } else {
                log.warn("Dashboard Auth Failed: Token found but validation failed (Secret key mismatch or expired)");
            }
        }

        filterChain.doFilter(request, response);
    }
}

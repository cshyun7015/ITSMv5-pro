package com.itsm.dashboard.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtTokenProvider {

    @Value("${jwt.secret:ITSMLongSecretKeyForSecurityPurposes1234567890!}")
    private String jwtSecret;

    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String resolveToken(HttpServletRequest request) {
        // Method 1: Standard HttpServletRequest.getCookies()
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("ITSMSession".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        
        // Method 2: Manual header parsing (Fallback for some proxy configurations)
        String cookieHeader = request.getHeader("Cookie");
        if (cookieHeader != null && cookieHeader.contains("ITSMSession=")) {
            String[] cookies = cookieHeader.split(";");
            for (String cookie : cookies) {
                String trimmed = cookie.trim();
                if (trimmed.startsWith("ITSMSession=")) {
                    return trimmed.substring("ITSMSession=".length());
                }
            }
        }
        
        return null;
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public String getUserId(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public Claims getClaims(String token) {
        return Jwts.parserBuilder().setSigningKey(getSigningKey()).build()
                .parseClaimsJws(token).getBody();
    }
}

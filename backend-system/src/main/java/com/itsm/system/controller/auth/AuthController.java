package com.itsm.system.controller.auth;

import com.itsm.system.dto.auth.AuthResponse;
import com.itsm.system.dto.auth.LoginRequest;
import com.itsm.system.dto.auth.SignupRequest;
import com.itsm.system.security.JwtTokenProvider;
import com.itsm.system.service.auth.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider tokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        String token = authService.createToken(response);
        
        ResponseCookie cookie = tokenProvider.createHttpOnlyCookie(token);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@RequestBody SignupRequest request) {
        AuthResponse response = authService.signup(request);
        String token = authService.createToken(response);
        
        ResponseCookie cookie = tokenProvider.createHttpOnlyCookie(token);
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        ResponseCookie cookie = ResponseCookie.from("ITSMSession", "")
                .httpOnly(true)
                .path("/")
                .maxAge(0)
                .build();
        
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        String userId = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
        if ("anonymousUser".equals(userId)) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(authService.getUserProfile(userId));
    }
}

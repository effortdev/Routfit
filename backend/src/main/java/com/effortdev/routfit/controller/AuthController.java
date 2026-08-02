package com.effortdev.routfit.controller;

import com.effortdev.routfit.config.CurrentUserId;
import com.effortdev.routfit.dto.AuthDtos.*;
import com.effortdev.routfit.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/google")
    public TokenResponse loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        return authService.loginWithGoogle(request.idToken());
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        return authService.refresh(request.refreshToken());
    }

    @GetMapping("/me")
    public UserProfileResponse getProfile(@CurrentUserId Long userId) {
        return authService.getProfile(userId);
    }

    @PatchMapping("/me")
    public UserProfileResponse updateProfile(@CurrentUserId Long userId, @RequestBody ProfileUpdateRequest request) {
        return authService.updateProfile(userId, request);
    }
}

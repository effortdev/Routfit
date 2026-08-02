package com.effortdev.roufit.dto;

import com.effortdev.roufit.domain.Gender;
import jakarta.validation.constraints.NotBlank;

public class AuthDtos {

    public record GoogleLoginRequest(@NotBlank String idToken) {}

    public record TokenResponse(String accessToken, String refreshToken, UserProfileResponse user) {}

    public record RefreshRequest(@NotBlank String refreshToken) {}

    public record UserProfileResponse(Long id, String email, String name, Double heightCm, Gender gender) {}

    public record ProfileUpdateRequest(Double heightCm, Gender gender) {}
}

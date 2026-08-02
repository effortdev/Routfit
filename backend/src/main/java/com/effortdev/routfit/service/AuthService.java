package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.User;
import com.effortdev.routfit.dto.AuthDtos.*;
import com.effortdev.routfit.repository.UserRepository;
import com.effortdev.routfit.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final GoogleTokenVerifier googleTokenVerifier;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public TokenResponse loginWithGoogle(String idToken) {
        GoogleTokenVerifier.GoogleUserInfo info = googleTokenVerifier.verify(idToken);

        User user = userRepository.findByGoogleSub(info.sub())
                .orElseGet(() -> userRepository.save(
                        User.builder()
                                .email(info.email())
                                .name(info.name() != null ? info.name() : info.email())
                                .googleSub(info.sub())
                                .build()
                ));

        return issueTokens(user);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken) || !jwtTokenProvider.isRefreshToken(refreshToken)) {
            throw new IllegalArgumentException("유효하지 않은 refresh token 입니다.");
        }
        Long userId = jwtTokenProvider.getUserId(refreshToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        return issueTokens(user);
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = getUser(userId);
        return toProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, ProfileUpdateRequest request) {
        User user = getUser(userId);
        user.updateProfile(request.heightCm(), request.gender());
        return toProfileResponse(user);
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private TokenResponse issueTokens(User user) {
        String access = jwtTokenProvider.createAccessToken(user.getId());
        String refresh = jwtTokenProvider.createRefreshToken(user.getId());
        return new TokenResponse(access, refresh, toProfileResponse(user));
    }

    private UserProfileResponse toProfileResponse(User user) {
        return new UserProfileResponse(user.getId(), user.getEmail(), user.getName(), user.getHeightCm(), user.getGender());
    }
}

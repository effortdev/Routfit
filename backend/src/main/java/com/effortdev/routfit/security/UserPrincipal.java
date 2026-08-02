package com.effortdev.routfit.security;

// SecurityContext에 담기는 인증된 유저 식별자
public record UserPrincipal(Long userId) {}

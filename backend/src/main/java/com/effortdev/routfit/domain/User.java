package com.effortdev.routfit.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    // Google OAuth의 sub (고유 식별자)
    @Column(name = "google_sub", unique = true)
    private String googleSub;

    private Double heightCm;

    @Enumerated(EnumType.STRING)
    private Gender gender;

    @Column(name = "last_metric_at")
    private LocalDateTime lastMetricAt;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public User(String email, String name, String googleSub, Double heightCm, Gender gender) {
        this.email = email;
        this.name = name;
        this.googleSub = googleSub;
        this.heightCm = heightCm;
        this.gender = gender;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void updateProfile(Double heightCm, Gender gender) {
        if (heightCm != null) this.heightCm = heightCm;
        if (gender != null) this.gender = gender;
    }

    public void markMetricSynced() {
        this.lastMetricAt = LocalDateTime.now();
    }
}

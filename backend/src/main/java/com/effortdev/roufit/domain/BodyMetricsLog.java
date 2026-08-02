package com.effortdev.roufit.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "body_metrics_logs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "record_date"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BodyMetricsLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "record_date", nullable = false)
    private LocalDate recordDate;

    @Column(name = "weight_kg", nullable = false)
    private Double weightKg;

    @Column(name = "body_fat_percent")
    private Double bodyFatPercent;

    // 수동 입력인지 기록 (추후 자동 연동 확장 대비)
    @Column(name = "source", nullable = false)
    private String source;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Builder
    public BodyMetricsLog(User user, LocalDate recordDate, Double weightKg, Double bodyFatPercent, String source) {
        this.user = user;
        this.recordDate = recordDate;
        this.weightKg = weightKg;
        this.bodyFatPercent = bodyFatPercent;
        this.source = source == null ? "MANUAL" : source;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public void update(Double weightKg, Double bodyFatPercent) {
        if (weightKg != null) this.weightKg = weightKg;
        if (bodyFatPercent != null) this.bodyFatPercent = bodyFatPercent;
    }
}

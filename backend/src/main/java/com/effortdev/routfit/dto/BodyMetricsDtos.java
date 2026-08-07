package com.effortdev.routfit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;

public class BodyMetricsDtos {

    public record UpsertMetricsRequest(
            @NotNull LocalDate recordDate,
            @NotNull @Positive Double weightKg,
            Double bodyFatPercent
    ) {}

    public record MetricsResponse(
            Long id,
            LocalDate recordDate,
            Double weightKg,
            Double bodyFatPercent,
            Integer bodyFatLevel,
            String source,
            boolean hasPhoto
    ) {}

    public record BodyFatLevelResponse(
            Integer currentLevel,
            Double currentBodyFatPercent,
            Integer nextLevel,
            Double nextLevelThreshold,
            String levelLabel,
            String message
    ) {}
}
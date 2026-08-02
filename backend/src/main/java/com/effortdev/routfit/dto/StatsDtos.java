package com.effortdev.routfit.dto;

import java.time.LocalDate;
import java.util.List;

public class StatsDtos {

    public record HeatmapCell(LocalDate date, double achievementRate, int completedCount, int totalCount) {}

    public record HeatmapResponse(List<HeatmapCell> cells) {}

    public record MetricsTrendPoint(LocalDate date, Double weightKg, Double bodyFatPercent) {}

    public record MetricsTrendResponse(List<MetricsTrendPoint> points) {}

    public record DashboardResponse(
            RoutineDtos.DailyProgressResponse todayProgress,
            BodyMetricsDtos.BodyFatLevelResponse bodyFatLevel,
            int currentStreakDays
    ) {}
}

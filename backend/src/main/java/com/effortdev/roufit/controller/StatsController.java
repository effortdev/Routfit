package com.effortdev.roufit.controller;

import com.effortdev.roufit.config.CurrentUserId;
import com.effortdev.roufit.dto.StatsDtos.*;
import com.effortdev.roufit.service.StatsService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/stats")
@RequiredArgsConstructor
public class StatsController {

    private final StatsService statsService;

    @GetMapping("/heatmap")
    public HeatmapResponse getHeatmap(@CurrentUserId Long userId,
                                       @RequestParam LocalDate start,
                                       @RequestParam LocalDate end) {
        return statsService.getHeatmap(userId, start, end);
    }

    @GetMapping("/metrics-trend")
    public MetricsTrendResponse getMetricsTrend(@CurrentUserId Long userId,
                                                 @RequestParam LocalDate start,
                                                 @RequestParam LocalDate end) {
        return statsService.getMetricsTrend(userId, start, end);
    }

    @GetMapping("/dashboard")
    public DashboardResponse getDashboard(@CurrentUserId Long userId) {
        return statsService.getDashboard(userId);
    }
}

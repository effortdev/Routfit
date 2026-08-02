package com.effortdev.roufit.controller;

import com.effortdev.roufit.config.CurrentUserId;
import com.effortdev.roufit.dto.BodyMetricsDtos.*;
import com.effortdev.roufit.service.BodyMetricsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/body-metrics")
@RequiredArgsConstructor
public class BodyMetricsController {

    private final BodyMetricsService bodyMetricsService;

    // 몸무게/체지방률 수동 입력 (같은 날짜면 덮어쓰기)
    @PostMapping
    public MetricsResponse upsert(@CurrentUserId Long userId, @Valid @RequestBody UpsertMetricsRequest request) {
        return bodyMetricsService.upsert(userId, request);
    }

    @GetMapping
    public List<MetricsResponse> getRange(@CurrentUserId Long userId,
                                           @RequestParam LocalDate start,
                                           @RequestParam LocalDate end) {
        return bodyMetricsService.getRange(userId, start, end);
    }

    @GetMapping("/level")
    public BodyFatLevelResponse getCurrentLevel(@CurrentUserId Long userId) {
        return bodyMetricsService.getCurrentLevel(userId);
    }
}

package com.effortdev.routfit.controller;

import com.effortdev.routfit.config.CurrentUserId;
import com.effortdev.routfit.dto.BodyMetricsDtos.*;
import com.effortdev.routfit.service.BodyMetricsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    // 그날 진행 사진 업로드 (그날 몸무게 기록이 먼저 있어야 함)
    @PostMapping("/{date}/photo")
    public MetricsResponse uploadPhoto(@CurrentUserId Long userId, @PathVariable LocalDate date,
                                       @RequestParam("photo") MultipartFile photo) {
        return bodyMetricsService.uploadPhoto(userId, date, photo);
    }

    // 그날 진행 사진 조회 (본인 것만, JWT 인증 필요)
    @GetMapping("/{date}/photo")
    public ResponseEntity<Resource> getPhoto(@CurrentUserId Long userId, @PathVariable LocalDate date) {
        Resource resource = bodyMetricsService.getPhotoResource(userId, date);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(resource);
    }
}
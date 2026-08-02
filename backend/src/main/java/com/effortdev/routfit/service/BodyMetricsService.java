package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.BodyMetricsLog;
import com.effortdev.routfit.domain.User;
import com.effortdev.routfit.dto.BodyMetricsDtos.*;
import com.effortdev.routfit.repository.BodyMetricsLogRepository;
import com.effortdev.routfit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BodyMetricsService {

    private final BodyMetricsLogRepository bodyMetricsLogRepository;
    private final UserRepository userRepository;
    private final BodyFatLevelService bodyFatLevelService;
    private final BodyFatEstimationService bodyFatEstimationService;

    @Transactional
    public MetricsResponse upsert(Long userId, UpsertMetricsRequest request) {
        User user = getUser(userId);
        Double bodyFatPercent = resolveBodyFatPercent(user, request.weightKg(), request.bodyFatPercent());

        BodyMetricsLog log = bodyMetricsLogRepository.findByUserIdAndRecordDate(userId, request.recordDate())
                .map(existing -> {
                    existing.update(request.weightKg(), bodyFatPercent);
                    return existing;
                })
                .orElseGet(() -> bodyMetricsLogRepository.save(BodyMetricsLog.builder()
                        .user(user)
                        .recordDate(request.recordDate())
                        .weightKg(request.weightKg())
                        .bodyFatPercent(bodyFatPercent)
                        .source("MANUAL")
                        .build()));

        user.markMetricSynced();

        return toResponse(log, user);
    }

    /**
     * 사용자가 체지방률을 직접 입력했으면 그 값을 그대로 쓰고(수동 우선),
     * 입력하지 않았고 키/성별 정보가 있으면 몸무게 기반으로 자동 추정함.
     */
    private Double resolveBodyFatPercent(User user, Double weightKg, Double manualBodyFatPercent) {
        if (manualBodyFatPercent != null) {
            return manualBodyFatPercent;
        }
        if (user.getHeightCm() == null || user.getGender() == null) {
            return null; // 키/성별이 아직 없으면 추정 불가 (마이페이지에서 먼저 입력 필요)
        }
        return bodyFatEstimationService.estimate(user.getGender(), user.getAge(), user.getHeightCm(), weightKg);
    }

    public List<MetricsResponse> getRange(Long userId, LocalDate start, LocalDate end) {
        User user = getUser(userId);
        return bodyMetricsLogRepository.findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(userId, start, end)
                .stream()
                .map(log -> toResponse(log, user))
                .collect(Collectors.toList());
    }

    public BodyFatLevelResponse getCurrentLevel(Long userId) {
        User user = getUser(userId);
        return bodyMetricsLogRepository.findFirstByUserIdOrderByRecordDateDesc(userId)
                .map(log -> bodyFatLevelService.calculate(user.getGender(), log.getBodyFatPercent()))
                .orElseGet(() -> bodyFatLevelService.calculate(user.getGender(), null));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private MetricsResponse toResponse(BodyMetricsLog log, User user) {
        Integer level = bodyFatLevelService.calculate(user.getGender(), log.getBodyFatPercent()).currentLevel();
        return new MetricsResponse(log.getId(), log.getRecordDate(), log.getWeightKg(), log.getBodyFatPercent(), level, log.getSource());
    }
}
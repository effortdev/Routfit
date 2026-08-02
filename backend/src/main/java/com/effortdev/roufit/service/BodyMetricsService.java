package com.effortdev.roufit.service;

import com.effortdev.roufit.domain.BodyMetricsLog;
import com.effortdev.roufit.domain.User;
import com.effortdev.roufit.dto.BodyMetricsDtos.*;
import com.effortdev.roufit.repository.BodyMetricsLogRepository;
import com.effortdev.roufit.repository.UserRepository;
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

    @Transactional
    public MetricsResponse upsert(Long userId, UpsertMetricsRequest request) {
        User user = getUser(userId);

        BodyMetricsLog log = bodyMetricsLogRepository.findByUserIdAndRecordDate(userId, request.recordDate())
                .map(existing -> {
                    existing.update(request.weightKg(), request.bodyFatPercent());
                    return existing;
                })
                .orElseGet(() -> bodyMetricsLogRepository.save(BodyMetricsLog.builder()
                        .user(user)
                        .recordDate(request.recordDate())
                        .weightKg(request.weightKg())
                        .bodyFatPercent(request.bodyFatPercent())
                        .source("MANUAL")
                        .build()));

        user.markMetricSynced();

        return toResponse(log, user);
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

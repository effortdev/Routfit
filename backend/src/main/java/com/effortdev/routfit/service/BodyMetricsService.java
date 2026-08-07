package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.BodyMetricsLog;
import com.effortdev.routfit.domain.User;
import com.effortdev.routfit.dto.BodyMetricsDtos.*;
import com.effortdev.routfit.repository.BodyMetricsLogRepository;
import com.effortdev.routfit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
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

    @Value("${app.upload-dir:/app/uploads}")
    private String uploadDir;

    private static final List<String> ALLOWED_CONTENT_TYPES = List.of("image/jpeg", "image/png", "image/webp");

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

    // 그날 진행 사진 업로드. 그날 몸무게 기록이 먼저 있어야 함(같은 날짜의 BodyMetricsLog에 매달림).
    // 이미 사진이 있던 날짜면 새 파일로 교체하고, 확장자가 달라져서 파일명이 바뀌는 경우 이전 파일은 정리함.
    @Transactional
    public MetricsResponse uploadPhoto(Long userId, LocalDate date, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("업로드할 사진이 없습니다.");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new IllegalArgumentException("jpg, png, webp 형식의 이미지만 업로드할 수 있습니다.");
        }

        User user = getUser(userId);
        BodyMetricsLog log = bodyMetricsLogRepository.findByUserIdAndRecordDate(userId, date)
                .orElseThrow(() -> new IllegalArgumentException("먼저 그날 몸무게를 기록해야 사진을 올릴 수 있습니다."));

        String previousFilename = log.getPhotoFilename();
        String ext = extensionFor(file.getContentType());
        String filename = userId + "_" + date + "." + ext;

        try {
            Path dir = Path.of(uploadDir, "progress-photos");
            Files.createDirectories(dir);
            Path target = dir.resolve(filename);
            file.transferTo(target);

            // 기존 파일 확장자가 달라서 파일명이 바뀐 경우, 예전 파일은 지워서 용량 안 남게 정리
            if (previousFilename != null && !previousFilename.equals(filename)) {
                Files.deleteIfExists(dir.resolve(previousFilename));
            }
        } catch (IOException e) {
            throw new UncheckedIOException("사진 저장에 실패했습니다.", e);
        }

        log.updatePhoto(filename);
        return toResponse(log, user);
    }

    // 그날 사진 삭제 (몸무게 기록 자체는 남기고 사진만 제거)
    @Transactional
    public MetricsResponse deletePhoto(Long userId, LocalDate date) {
        User user = getUser(userId);
        BodyMetricsLog log = bodyMetricsLogRepository.findByUserIdAndRecordDate(userId, date)
                .orElseThrow(() -> new IllegalArgumentException("그날 기록을 찾을 수 없습니다."));

        String filename = log.getPhotoFilename();
        if (filename != null) {
            try {
                Files.deleteIfExists(Path.of(uploadDir, "progress-photos", filename));
            } catch (IOException e) {
                throw new UncheckedIOException("사진 삭제에 실패했습니다.", e);
            }
            log.updatePhoto(null);
        }

        return toResponse(log, user);
    }

    // 본인 소유 확인 후 그날 사진 파일 리소스 반환 (컨트롤러에서 스트리밍)
    public Resource getPhotoResource(Long userId, LocalDate date) {
        BodyMetricsLog log = bodyMetricsLogRepository.findByUserIdAndRecordDate(userId, date)
                .orElseThrow(() -> new IllegalArgumentException("그날 기록을 찾을 수 없습니다."));
        if (log.getPhotoFilename() == null) {
            throw new IllegalArgumentException("그날 등록된 사진이 없습니다.");
        }
        Path path = Path.of(uploadDir, "progress-photos", log.getPhotoFilename());
        return new FileSystemResource(path);
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            default -> "jpg";
        };
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private MetricsResponse toResponse(BodyMetricsLog log, User user) {
        Integer level = bodyFatLevelService.calculate(user.getGender(), log.getBodyFatPercent()).currentLevel();
        return new MetricsResponse(
                log.getId(), log.getRecordDate(), log.getWeightKg(), log.getBodyFatPercent(),
                level, log.getSource(), log.getPhotoFilename() != null
        );
    }
}
package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.Gender;
import com.effortdev.routfit.dto.BodyMetricsDtos.BodyFatLevelResponse;
import org.springframework.stereotype.Service;

/**
 * 체지방률(%)을 성별 기준 1~7단계로 변환하는 서비스.
 * 일반적으로 통용되는 체지방률 구간(대회 선수 수준~비만구간) 자료를 참고해 임계값을 잡았고,
 * 원본 자료는 1=체지방 가장 낮음(대회 선수) ~ 7=체지방 가장 높음(비만) 순서지만,
 * 이 앱은 "레벨업 = 목표에 가까워짐" 컨셉이라 숫자 방향을 반대로 뒤집었음.
 * Level 1 = 비만구간(체지방 가장 높음), Level 7 = 대회 선수 수준(체지방 가장 낮음, 목표).
 */
@Service
public class BodyFatLevelService {

    // 각 배열의 인덱스 i는 "Level (i+2)로 올라가기 위해 내려가야 하는 체지방률 상한선"을 의미.
    // 예: MALE_THRESHOLDS[0] = 33.0 → 체지방률 33% 이상이면 Level 1(비만구간)
    private static final double[] MALE_THRESHOLDS =   {33, 28, 23, 18, 12, 7};
    private static final double[] FEMALE_THRESHOLDS = {38, 33, 28, 23, 18, 14};

    private static final int MAX_LEVEL = 7;

    // Level 1(비만구간) ~ Level 7(대회 선수 수준) 순서로, 참고 자료의 구간명을 그대로 사용
    private static final String[] LEVEL_LABELS = {
            "비만구간", "체지방 과다", "살짝 통통", "가장 건강한 표준 구간", "피트니스 몸", "운동선수 몸", "대회 선수 수준"
    };

    public BodyFatLevelResponse calculate(Gender gender, Double bodyFatPercent) {
        if (bodyFatPercent == null) {
            return new BodyFatLevelResponse(null, null, null, null, null, "체지방률을 입력하면 현재 단계를 확인할 수 있어요.");
        }

        double[] thresholds = (gender == Gender.FEMALE) ? FEMALE_THRESHOLDS : MALE_THRESHOLDS;
        int level = levelFromPercent(thresholds, bodyFatPercent);
        Integer nextLevel = level < MAX_LEVEL ? level + 1 : null;
        Double nextThreshold = nextLevelThreshold(thresholds, level);
        String label = LEVEL_LABELS[level - 1];

        String message = buildMessage(level, nextThreshold);
        return new BodyFatLevelResponse(level, bodyFatPercent, nextLevel, nextThreshold, label, message);
    }

    private int levelFromPercent(double[] thresholds, double bodyFatPercent) {
        // thresholds는 내림차순 (Level 1 기준값부터 Level 6->7 기준값까지)
        for (int i = 0; i < thresholds.length; i++) {
            if (bodyFatPercent >= thresholds[i]) {
                return i + 1;
            }
        }
        return MAX_LEVEL; // 모든 임계값보다 낮으면 최고 레벨(대회 선수 수준)
    }

    private Double nextLevelThreshold(double[] thresholds, int currentLevel) {
        if (currentLevel >= MAX_LEVEL) return null;
        // 다음 레벨로 가기 위해 도달해야 하는 체지방률 = 현재 레벨에 해당하는 임계값
        return thresholds[currentLevel - 1];
    }

    private String buildMessage(int level, Double nextThreshold) {
        if (level >= MAX_LEVEL) {
            return "최고 단계(대회 선수 수준)에 도달했어요. 지금 컨디션을 유지해보세요!";
        }
        String nextLabel = LEVEL_LABELS[level]; // level은 1-indexed이므로 다음 레벨 라벨은 그대로 인덱스로 접근
        return String.format("체지방률을 %.1f%% 아래로 낮추면 '%s' 단계로 올라가요.", nextThreshold, nextLabel);
    }
}
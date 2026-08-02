package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.Gender;
import com.effortdev.routfit.dto.BodyMetricsDtos.BodyFatLevelResponse;
import org.springframework.stereotype.Service;

/**
 * 체지방률(%)을 성별 기준 1~10단계로 변환하는 서비스.
 * 의학적 기준이 아닌 "동기부여용" 커스텀 구간이며, 필요시 자유롭게 임계값을 조정하면 됨.
 * Level 1 = 체지방률이 가장 높은 시작 단계, Level 10 = 가장 낮은(목표) 단계.
 */
@Service
public class BodyFatLevelService {

    // 각 배열의 인덱스 i는 "Level (i+2)로 올라가기 위한 상한선"을 의미.
    // 예: MALE_THRESHOLDS[0] = 30.0 → 체지방률 30% 이상이면 Level 1
    private static final double[] MALE_THRESHOLDS =   {30, 25, 22, 20, 18, 16, 14, 12, 10};
    private static final double[] FEMALE_THRESHOLDS = {40, 35, 32, 30, 27, 24, 22, 20, 18};

    public BodyFatLevelResponse calculate(Gender gender, Double bodyFatPercent) {
        if (bodyFatPercent == null) {
            return new BodyFatLevelResponse(null, null, null, null, "체지방률을 입력하면 현재 단계를 확인할 수 있어요.");
        }

        double[] thresholds = (gender == Gender.FEMALE) ? FEMALE_THRESHOLDS : MALE_THRESHOLDS;
        int level = levelFromPercent(thresholds, bodyFatPercent);
        Integer nextLevel = level < 10 ? level + 1 : null;
        Double nextThreshold = nextLevelThreshold(thresholds, level);

        String message = buildMessage(level, nextThreshold);
        return new BodyFatLevelResponse(level, bodyFatPercent, nextLevel, nextThreshold, message);
    }

    private int levelFromPercent(double[] thresholds, double bodyFatPercent) {
        // thresholds는 내림차순 (Level 1 기준값부터 Level 9->10 기준값까지)
        for (int i = 0; i < thresholds.length; i++) {
            if (bodyFatPercent >= thresholds[i]) {
                return i + 1;
            }
        }
        return 10; // 모든 임계값보다 낮으면 최고 레벨
    }

    private Double nextLevelThreshold(double[] thresholds, int currentLevel) {
        if (currentLevel >= 10) return null;
        // 다음 레벨로 가기 위해 도달해야 하는 체지방률 = 현재 레벨에 해당하는 임계값
        return thresholds[currentLevel - 1];
    }

    private String buildMessage(int level, Double nextThreshold) {
        if (level >= 10) {
            return "최고 단계(Level 10)에 도달했어요. 지금 컨디션을 유지해보세요!";
        }
        return String.format("체지방률을 %.1f%% 아래로 낮추면 Level %d로 올라가요.", nextThreshold, level + 1);
    }
}

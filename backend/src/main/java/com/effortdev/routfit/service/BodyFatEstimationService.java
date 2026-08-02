package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.Gender;
import org.springframework.stereotype.Service;

/**
 * 키/몸무게/성별/나이만으로 체지방률(%)을 추정하는 서비스.
 * 체지방계나 인바디 없이도 "대략적인" 체지방률을 자동으로 채워주기 위한 용도이며,
 * 캘리퍼스/DEXA 같은 정밀 측정 대비 오차가 있을 수 있음 (동기부여용 근사치).
 *
 * Deurenberg 공식 사용:
 *   체지방률(%) = 1.20 × BMI + 0.23 × 나이 − 10.8 × 성별계수 − 5.4
 *   (성별계수: 남성 1, 여성 0)
 */
@Service
public class BodyFatEstimationService {

    private static final int DEFAULT_AGE = 30; // 나이 미입력 시 가정하는 평균 성인 나이

    public double estimate(Gender gender, Integer age, double heightCm, double weightKg) {
        double heightM = heightCm / 100.0;
        double bmi = weightKg / (heightM * heightM);
        int effectiveAge = age != null ? age : DEFAULT_AGE;
        double genderFactor = (gender == Gender.MALE) ? 1.0 : 0.0;

        double bodyFatPercent = (1.20 * bmi) + (0.23 * effectiveAge) - (10.8 * genderFactor) - 5.4;

        // 비정상적인 음수/과대값 방지 (사람이 가질 수 있는 현실적인 범위로 클램프)
        return Math.max(3.0, Math.min(60.0, bodyFatPercent));
    }
}
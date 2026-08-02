package com.effortdev.roufit.repository;

import com.effortdev.roufit.domain.BodyMetricsLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface BodyMetricsLogRepository extends JpaRepository<BodyMetricsLog, Long> {
    Optional<BodyMetricsLog> findByUserIdAndRecordDate(Long userId, LocalDate recordDate);
    List<BodyMetricsLog> findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(Long userId, LocalDate start, LocalDate end);
    Optional<BodyMetricsLog> findFirstByUserIdOrderByRecordDateDesc(Long userId);
}

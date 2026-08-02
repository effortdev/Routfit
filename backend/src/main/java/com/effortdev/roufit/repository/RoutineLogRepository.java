package com.effortdev.roufit.repository;

import com.effortdev.roufit.domain.RoutineLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface RoutineLogRepository extends JpaRepository<RoutineLog, Long> {
    List<RoutineLog> findByUserIdAndLogDate(Long userId, LocalDate logDate);
    Optional<RoutineLog> findByRoutineIdAndLogDate(Long routineId, LocalDate logDate);
    List<RoutineLog> findByUserIdAndLogDateBetween(Long userId, LocalDate start, LocalDate end);
}

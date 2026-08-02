package com.effortdev.roufit.repository;

import com.effortdev.roufit.domain.DailyMemo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;

public interface DailyMemoRepository extends JpaRepository<DailyMemo, Long> {
    Optional<DailyMemo> findByUserIdAndLogDate(Long userId, LocalDate logDate);
}

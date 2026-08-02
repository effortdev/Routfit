package com.effortdev.routfit.repository;

import com.effortdev.routfit.domain.Routine;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserIdAndActiveTrueOrderBySortOrderAsc(Long userId);
    List<Routine> findByUserIdOrderBySortOrderAsc(Long userId);
}

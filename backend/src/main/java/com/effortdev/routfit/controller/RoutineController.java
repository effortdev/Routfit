package com.effortdev.routfit.controller;

import com.effortdev.routfit.config.CurrentUserId;
import com.effortdev.routfit.dto.RoutineDtos.*;
import com.effortdev.routfit.service.RoutineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/routines")
@RequiredArgsConstructor
public class RoutineController {

    private final RoutineService routineService;

    @PostMapping
    public RoutineResponse create(@CurrentUserId Long userId, @Valid @RequestBody CreateRoutineRequest request) {
        return routineService.create(userId, request);
    }

    @GetMapping("/today")
    public List<RoutineResponse> getToday(@CurrentUserId Long userId) {
        return routineService.getTodayRoutines(userId);
    }

    // 히트맵에서 특정 날짜 클릭 시, 그날 체크했던 루틴 목록 조회
    @GetMapping("/logs")
    public List<RoutineResponse> getRoutinesForDate(@CurrentUserId Long userId, @RequestParam LocalDate date) {
        return routineService.getRoutinesForDate(userId, date);
    }

    @PutMapping("/{routineId}")
    public RoutineResponse update(@CurrentUserId Long userId, @PathVariable Long routineId,
                                  @RequestBody UpdateRoutineRequest request) {
        return routineService.update(userId, routineId, request);
    }

    @DeleteMapping("/{routineId}")
    public void delete(@CurrentUserId Long userId, @PathVariable Long routineId) {
        routineService.delete(userId, routineId);
    }

    @PostMapping("/{routineId}/logs")
    public DailyProgressResponse toggleLog(@CurrentUserId Long userId, @PathVariable Long routineId,
                                            @RequestBody ToggleLogRequest request) {
        return routineService.toggleLog(userId, routineId, request);
    }

    @GetMapping("/progress")
    public DailyProgressResponse getProgress(@CurrentUserId Long userId,
                                              @RequestParam(required = false) LocalDate date) {
        return routineService.getDailyProgress(userId, date != null ? date : LocalDate.now());
    }
}

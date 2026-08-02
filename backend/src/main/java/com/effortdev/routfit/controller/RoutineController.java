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

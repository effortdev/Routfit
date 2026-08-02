package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.RoutineLog;
import com.effortdev.routfit.dto.StatsDtos.*;
import com.effortdev.routfit.repository.BodyMetricsLogRepository;
import com.effortdev.routfit.repository.RoutineLogRepository;
import com.effortdev.routfit.repository.RoutineRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StatsService {

    private final RoutineLogRepository routineLogRepository;
    private final RoutineRepository routineRepository;
    private final BodyMetricsLogRepository bodyMetricsLogRepository;
    private final RoutineService routineService;
    private final BodyMetricsService bodyMetricsService;

    // 깃허브 스타일 히트맵: 최근 N일간의 일별 달성률
    public HeatmapResponse getHeatmap(Long userId, LocalDate start, LocalDate end) {
        List<RoutineLog> logs = routineLogRepository.findByUserIdAndLogDateBetween(userId, start, end);
        int totalActiveRoutines = routineRepository.findByUserIdAndActiveTrueOrderBySortOrderAsc(userId).size();

        Map<LocalDate, List<RoutineLog>> byDate = logs.stream()
                .collect(Collectors.groupingBy(RoutineLog::getLogDate));

        List<HeatmapCell> cells = start.datesUntil(end.plusDays(1))
                .map(date -> {
                    List<RoutineLog> dayLogs = byDate.getOrDefault(date, List.of());
                    long completed = dayLogs.stream().filter(RoutineLog::isCompleted).count();
                    int total = Math.max(totalActiveRoutines, dayLogs.size());
                    double rate = total == 0 ? 0.0 : Math.round((completed * 1000.0 / total)) / 10.0;
                    return new HeatmapCell(date, rate, (int) completed, total);
                })
                .collect(Collectors.toList());

        return new HeatmapResponse(cells);
    }

    public MetricsTrendResponse getMetricsTrend(Long userId, LocalDate start, LocalDate end) {
        List<MetricsTrendPoint> points = bodyMetricsLogRepository
                .findByUserIdAndRecordDateBetweenOrderByRecordDateAsc(userId, start, end)
                .stream()
                .map(log -> new MetricsTrendPoint(log.getRecordDate(), log.getWeightKg(), log.getBodyFatPercent()))
                .collect(Collectors.toList());
        return new MetricsTrendResponse(points);
    }

    public int getCurrentStreakDays(Long userId) {
        int totalActiveRoutines = routineRepository.findByUserIdAndActiveTrueOrderBySortOrderAsc(userId).size();
        if (totalActiveRoutines == 0) return 0;

        int streak = 0;
        LocalDate cursor = LocalDate.now();
        while (true) {
            List<RoutineLog> dayLogs = routineLogRepository.findByUserIdAndLogDate(userId, cursor);
            long completed = dayLogs.stream().filter(RoutineLog::isCompleted).count();
            boolean fullyCompleted = completed > 0 && completed >= totalActiveRoutines;
            if (!fullyCompleted) break;
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    public DashboardResponse getDashboard(Long userId) {
        var todayProgress = routineService.getDailyProgress(userId, LocalDate.now());
        var bodyFatLevel = bodyMetricsService.getCurrentLevel(userId);
        int streak = getCurrentStreakDays(userId);
        return new DashboardResponse(todayProgress, bodyFatLevel, streak);
    }
}

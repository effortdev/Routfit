package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.Routine;
import com.effortdev.routfit.domain.RoutineLog;
import com.effortdev.routfit.domain.User;
import com.effortdev.routfit.dto.RoutineDtos.*;
import com.effortdev.routfit.repository.RoutineLogRepository;
import com.effortdev.routfit.repository.RoutineRepository;
import com.effortdev.routfit.repository.UserRepository;
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
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineLogRepository routineLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public RoutineResponse create(Long userId, CreateRoutineRequest request) {
        User user = getUser(userId);
        int nextOrder = routineRepository.findByUserIdOrderBySortOrderAsc(userId).size();
        Routine routine = routineRepository.save(Routine.builder()
                .user(user)
                .title(request.title())
                .sortOrder(nextOrder)
                .build());
        return toResponse(routine, false);
    }

    public List<RoutineResponse> getTodayRoutines(Long userId) {
        LocalDate today = LocalDate.now();
        List<Routine> routines = routineRepository.findByUserIdAndActiveTrueOrderBySortOrderAsc(userId);
        List<RoutineLog> logs = routineLogRepository.findByUserIdAndLogDate(userId, today);
        Map<Long, Boolean> completedMap = logs.stream()
                .collect(Collectors.toMap(l -> l.getRoutine().getId(), RoutineLog::isCompleted));

        return routines.stream()
                .map(r -> toResponse(r, completedMap.getOrDefault(r.getId(), false)))
                .collect(Collectors.toList());
    }

    @Transactional
    public RoutineResponse update(Long userId, Long routineId, UpdateRoutineRequest request) {
        Routine routine = getOwnedRoutine(userId, routineId);
        routine.update(request.title(), request.sortOrder());
        boolean completedToday = routineLogRepository.findByRoutineIdAndLogDate(routineId, LocalDate.now())
                .map(RoutineLog::isCompleted).orElse(false);
        return toResponse(routine, completedToday);
    }

    @Transactional
    public void delete(Long userId, Long routineId) {
        Routine routine = getOwnedRoutine(userId, routineId);
        routine.deactivate();
    }

    @Transactional
    public DailyProgressResponse toggleLog(Long userId, Long routineId, ToggleLogRequest request) {
        Routine routine = getOwnedRoutine(userId, routineId);
        LocalDate date = request.date() != null ? request.date() : LocalDate.now();

        RoutineLog log = routineLogRepository.findByRoutineIdAndLogDate(routineId, date)
                .orElseGet(() -> routineLogRepository.save(RoutineLog.builder()
                        .routine(routine)
                        .user(routine.getUser())
                        .logDate(date)
                        .completed(false)
                        .build()));
        log.toggle(request.completed());

        return getDailyProgress(userId, date);
    }

    public DailyProgressResponse getDailyProgress(Long userId, LocalDate date) {
        List<Routine> activeRoutines = routineRepository.findByUserIdAndActiveTrueOrderBySortOrderAsc(userId);
        List<RoutineLog> logs = routineLogRepository.findByUserIdAndLogDate(userId, date);
        int total = activeRoutines.size();
        long completed = logs.stream().filter(RoutineLog::isCompleted).count();
        double rate = total == 0 ? 0.0 : Math.round((completed * 1000.0 / total)) / 10.0;
        return new DailyProgressResponse(date, total, (int) completed, rate);
    }

    private Routine getOwnedRoutine(Long userId, Long routineId) {
        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new IllegalArgumentException("루틴을 찾을 수 없습니다."));
        if (!routine.getUser().getId().equals(userId)) {
            throw new SecurityException("본인의 루틴만 접근할 수 있습니다.");
        }
        return routine;
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private RoutineResponse toResponse(Routine routine, boolean completedToday) {
        return new RoutineResponse(routine.getId(), routine.getTitle(), routine.getSortOrder(), routine.isActive(), completedToday);
    }
}

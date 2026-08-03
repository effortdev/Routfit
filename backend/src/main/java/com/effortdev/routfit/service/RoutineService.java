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
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Optional;
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

    // "오늘" 목록은 항상 지금 활성 상태인 루틴만 보여줘야 함 (체크 후 삭제해도 즉시 사라져야 함).
    // getRoutinesForDate와 다르게 재사용하지 않는 이유: getRoutinesForDate는 "삭제됐어도 그날 로그가
    // 있으면 과거 기록으로 보여준다"는 로직이 있어서, 오늘 체크 후 바로 삭제하면 당일에도
    // 계속 남아있는 것처럼 보이는 버그가 있었음.
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

    /**
     * 특정 날짜 기준으로 "그날 실제로 존재했던 루틴"을 정확하게 복원해서 조회.
     * - 그날 로그가 남아있는 루틴: 지금은 삭제(비활성화)됐어도 포함, 체크 상태 그대로 반영
     * - 그날 로그는 없지만 그 시점에 이미 생성되어 있었고 지금도 활성 상태인 루틴: 미체크로 포함
     * - 그 시점 이후에 새로 생성된 루틴은 제외 (그날 존재하지 않았으므로)
     * 오늘 목록(체크리스트)에는 쓰지 않음 - 그건 getTodayRoutines가 별도로 담당함.
     * 이 메서드는 히트맵에서 과거 날짜를 조회할 때만 사용.
     */
    public List<RoutineResponse> getRoutinesForDate(Long userId, LocalDate date) {
        List<RoutineLog> logs = routineLogRepository.findByUserIdAndLogDate(userId, date);
        Map<Long, RoutineLog> logByRoutineId = logs.stream()
                .collect(Collectors.toMap(l -> l.getRoutine().getId(), l -> l, (a, b) -> a));

        Map<Long, Routine> resultRoutines = new LinkedHashMap<>();

        // 1) 그날 로그가 있던 루틴 (지금 삭제됐어도 그 시점 데이터는 살아있음)
        for (RoutineLog log : logs) {
            resultRoutines.put(log.getRoutine().getId(), log.getRoutine());
        }

        // 2) 그 시점에 이미 존재했고 지금도 활성 상태인 루틴 (로그 없으면 미체크로 표시)
        LocalDate endOfDay = date.plusDays(1);
        routineRepository.findByUserIdAndActiveTrueOrderBySortOrderAsc(userId).stream()
                .filter(r -> r.getCreatedAt() != null && r.getCreatedAt().toLocalDate().isBefore(endOfDay))
                .forEach(r -> resultRoutines.putIfAbsent(r.getId(), r));

        return resultRoutines.values().stream()
                .map(r -> {
                    boolean completed = Optional.ofNullable(logByRoutineId.get(r.getId()))
                            .map(RoutineLog::isCompleted)
                            .orElse(false);
                    return toResponse(r, completed);
                })
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
        Set<Long> activeRoutineIds = activeRoutines.stream().map(Routine::getId).collect(Collectors.toSet());
        List<RoutineLog> logs = routineLogRepository.findByUserIdAndLogDate(userId, date);

        int total = activeRoutines.size();
        // 삭제(비활성화)된 루틴의 과거 체크 기록은 히트맵 히스토리용으로 남겨두지만,
        // "오늘 달성률"에는 지금 활성 상태인 루틴의 체크만 반영되어야 함.
        long completed = logs.stream()
                .filter(RoutineLog::isCompleted)
                .filter(l -> activeRoutineIds.contains(l.getRoutine().getId()))
                .count();
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

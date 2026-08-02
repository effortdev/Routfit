package com.effortdev.routfit.service;

import com.effortdev.routfit.domain.DailyMemo;
import com.effortdev.routfit.domain.User;
import com.effortdev.routfit.dto.DailyMemoDtos.*;
import com.effortdev.routfit.repository.DailyMemoRepository;
import com.effortdev.routfit.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DailyMemoService {

    private final DailyMemoRepository dailyMemoRepository;
    private final UserRepository userRepository;

    @Transactional
    public MemoResponse upsert(Long userId, UpsertMemoRequest request) {
        User user = getUser(userId);

        DailyMemo memo = dailyMemoRepository.findByUserIdAndLogDate(userId, request.logDate())
                .map(existing -> {
                    existing.updateContent(request.content());
                    return existing;
                })
                .orElseGet(() -> dailyMemoRepository.save(DailyMemo.builder()
                        .user(user)
                        .logDate(request.logDate())
                        .content(request.content())
                        .build()));

        return toResponse(memo);
    }

    public MemoResponse getByDate(Long userId, LocalDate date) {
        return dailyMemoRepository.findByUserIdAndLogDate(userId, date)
                .map(this::toResponse)
                .orElseGet(() -> new MemoResponse(date, null));
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
    }

    private MemoResponse toResponse(DailyMemo memo) {
        return new MemoResponse(memo.getLogDate(), memo.getContent());
    }
}
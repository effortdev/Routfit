package com.effortdev.routfit.controller;

import com.effortdev.routfit.config.CurrentUserId;
import com.effortdev.routfit.dto.DailyMemoDtos.*;
import com.effortdev.routfit.service.DailyMemoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/memos")
@RequiredArgsConstructor
public class DailyMemoController {

    private final DailyMemoService dailyMemoService;

    // 날짜별 메모 작성/수정 (같은 날짜면 덮어쓰기)
    @PostMapping
    public MemoResponse upsert(@CurrentUserId Long userId, @Valid @RequestBody UpsertMemoRequest request) {
        return dailyMemoService.upsert(userId, request);
    }

    @GetMapping
    public MemoResponse getByDate(@CurrentUserId Long userId, @RequestParam LocalDate date) {
        return dailyMemoService.getByDate(userId, date);
    }
}
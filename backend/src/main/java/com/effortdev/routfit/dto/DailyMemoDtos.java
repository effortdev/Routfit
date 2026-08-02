package com.effortdev.routfit.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

public class DailyMemoDtos {

    public record UpsertMemoRequest(
            @NotNull LocalDate logDate,
            @Size(max = 500) String content
    ) {}

    public record MemoResponse(
            LocalDate logDate,
            String content
    ) {}
}
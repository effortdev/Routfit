package com.effortdev.roufit.dto;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

public class RoutineDtos {

    public record CreateRoutineRequest(@NotBlank String title) {}

    public record UpdateRoutineRequest(String title, Integer sortOrder) {}

    public record RoutineResponse(Long id, String title, Integer sortOrder, boolean active, boolean completedToday) {}

    public record ToggleLogRequest(LocalDate date, boolean completed) {}

    public record DailyProgressResponse(LocalDate date, int totalCount, int completedCount, double achievementRate) {}
}

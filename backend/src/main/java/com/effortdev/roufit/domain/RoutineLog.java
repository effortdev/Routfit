package com.effortdev.roufit.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "routine_logs", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"routine_id", "log_date"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class RoutineLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    private Routine routine;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(nullable = false)
    private boolean completed;

    @Builder
    public RoutineLog(Routine routine, User user, LocalDate logDate, boolean completed) {
        this.routine = routine;
        this.user = user;
        this.logDate = logDate;
        this.completed = completed;
    }

    public void toggle(boolean completed) {
        this.completed = completed;
    }
}

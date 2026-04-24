package com.costpilot.timesheet.domain;

import com.costpilot.organization.domain.Employee;
import com.costpilot.organization.domain.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "timesheets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class TimeEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "employee_id", nullable = false)
    private Employee employee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 50)
    private String activityType;

    @Column(nullable = false)
    private LocalDate workDate;

    @Column(nullable = false, precision = 5, scale = 1)
    private BigDecimal hours;

    @Builder
    public TimeEntry(Employee employee, Project project, String activityType, LocalDate workDate, BigDecimal hours) {
        this.employee = employee;
        this.project = project;
        this.activityType = activityType;
        this.workDate = workDate;
        this.hours = hours;
    }
}

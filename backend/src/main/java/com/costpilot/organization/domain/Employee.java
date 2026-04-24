package com.costpilot.organization.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "employees")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_grade_id", nullable = false)
    private JobGrade jobGrade;

    @Column(nullable = false)
    private Integer hourlyRate;

    @Builder
    public Employee(String name, Department department, JobGrade jobGrade, Integer hourlyRate) {
        this.name = name;
        this.department = department;
        this.jobGrade = jobGrade;
        this.hourlyRate = hourlyRate;
    }

    public void updateHourlyRate(Integer hourlyRate) {
        this.hourlyRate = hourlyRate;
    }
}

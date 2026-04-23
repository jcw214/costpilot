package com.costpilot.organization.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "job_grades")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class JobGrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false)
    private Integer standardHourlyRate;

    @Builder
    public JobGrade(String code, String name, Integer standardHourlyRate) {
        this.code = code;
        this.name = name;
        this.standardHourlyRate = standardHourlyRate;
    }

    public void updateStandardHourlyRate(Integer standardHourlyRate) {
        this.standardHourlyRate = standardHourlyRate;
    }
}

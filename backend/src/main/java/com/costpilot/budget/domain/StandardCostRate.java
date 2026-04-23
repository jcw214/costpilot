package com.costpilot.budget.domain;

import com.costpilot.organization.domain.JobGrade;
import com.costpilot.organization.domain.ProjectType;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "standard_costs", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"project_type_id", "job_grade_id"})
})
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class StandardCostRate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_type_id", nullable = false)
    private ProjectType projectType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_grade_id", nullable = false)
    private JobGrade jobGrade;

    @Column(nullable = false, precision = 8, scale = 1)
    private BigDecimal standardHours;

    @Builder
    public StandardCostRate(ProjectType projectType, JobGrade jobGrade, BigDecimal standardHours) {
        this.projectType = projectType;
        this.jobGrade = jobGrade;
        this.standardHours = standardHours;
    }
}

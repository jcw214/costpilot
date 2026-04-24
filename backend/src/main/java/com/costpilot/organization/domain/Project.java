package com.costpilot.organization.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "projects")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_type_id", nullable = false)
    private ProjectType projectType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status;

    @Column(nullable = false)
    private Long contractAmount;

    private LocalDate startDate;

    private LocalDate endDate;

    @Builder
    public Project(String name, Department department, ProjectType projectType,
                   ProjectStatus status, Long contractAmount,
                   LocalDate startDate, LocalDate endDate) {
        this.name = name;
        this.department = department;
        this.projectType = projectType;
        this.status = status;
        this.contractAmount = contractAmount;
        this.startDate = startDate;
        this.endDate = endDate;
    }

    public void updateContractAmount(Long contractAmount) {
        this.contractAmount = contractAmount;
    }
}

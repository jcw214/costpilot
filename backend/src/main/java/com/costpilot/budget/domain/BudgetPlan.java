package com.costpilot.budget.domain;

import com.costpilot.organization.domain.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "budgets")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class BudgetPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false, unique = true)
    private Project project;

    @Column(nullable = false)
    private Long budgetAmount;

    @Column(nullable = false)
    private Integer fiscalYear;

    @Column(nullable = false)
    private Integer fiscalQuarter;

    @Builder
    public BudgetPlan(Project project, Long budgetAmount, Integer fiscalYear, Integer fiscalQuarter) {
        this.project = project;
        this.budgetAmount = budgetAmount;
        this.fiscalYear = fiscalYear;
        this.fiscalQuarter = fiscalQuarter;
    }
}

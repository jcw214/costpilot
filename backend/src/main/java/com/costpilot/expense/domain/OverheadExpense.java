package com.costpilot.expense.domain;

import com.costpilot.organization.domain.Department;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "overhead_costs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class OverheadExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false, length = 50)
    private String costCategory;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private LocalDate costMonth;

    @Builder
    public OverheadExpense(Department department, String costCategory, Long amount, LocalDate costMonth) {
        this.department = department;
        this.costCategory = costCategory;
        this.amount = amount;
        this.costMonth = costMonth;
    }
}

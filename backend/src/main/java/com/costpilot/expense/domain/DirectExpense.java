package com.costpilot.expense.domain;

import com.costpilot.organization.domain.Project;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "project_direct_costs")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class DirectExpense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Column(nullable = false, length = 50)
    private String costType;

    @Column(length = 200)
    private String vendorName;

    @Column(length = 500)
    private String description;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private LocalDate costDate;

    @Builder
    public DirectExpense(Project project, String costType, String vendorName, String description, Long amount, LocalDate costDate) {
        this.project = project;
        this.costType = costType;
        this.vendorName = vendorName;
        this.description = description;
        this.amount = amount;
        this.costDate = costDate;
    }
}

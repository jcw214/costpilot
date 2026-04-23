import os

base_path = r"c:\costpilot\backend\src\main\java\com\costpilot"

def create_dir(path):
    if not os.path.exists(path):
        os.makedirs(path)

domains = ['timesheet', 'expense', 'budget']
for d in domains:
    create_dir(os.path.join(base_path, d, 'domain'))
    create_dir(os.path.join(base_path, d, 'port', 'in'))
    create_dir(os.path.join(base_path, d, 'port', 'out'))
    create_dir(os.path.join(base_path, d, 'service'))
    create_dir(os.path.join(base_path, d, 'adapter', 'persistence'))
    create_dir(os.path.join(base_path, d, 'adapter', 'web'))
    create_dir(os.path.join(base_path, d, 'adapter', 'web', 'dto'))

files = {}

# TimeEntry Entity
files[r"timesheet\domain\TimeEntry.java"] = """package com.costpilot.timesheet.domain;

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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
"""

# DirectExpense Entity
files[r"expense\domain\DirectExpense.java"] = """package com.costpilot.expense.domain;

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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
"""

# OverheadExpense Entity
files[r"expense\domain\OverheadExpense.java"] = """package com.costpilot.expense.domain;

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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
"""

# StandardCostRate Entity
files[r"budget\domain\StandardCostRate.java"] = """package com.costpilot.budget.domain;

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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
"""

# BudgetPlan Entity
files[r"budget\domain\BudgetPlan.java"] = """package com.costpilot.budget.domain;

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
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
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
"""

# Basic Repositories
files[r"timesheet\adapter\persistence\JpaTimeEntryRepository.java"] = """package com.costpilot.timesheet.adapter.persistence;
import com.costpilot.timesheet.domain.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JpaTimeEntryRepository extends JpaRepository<TimeEntry, Long> {}
"""

files[r"expense\adapter\persistence\JpaDirectExpenseRepository.java"] = """package com.costpilot.expense.adapter.persistence;
import com.costpilot.expense.domain.DirectExpense;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JpaDirectExpenseRepository extends JpaRepository<DirectExpense, Long> {}
"""

files[r"expense\adapter\persistence\JpaOverheadExpenseRepository.java"] = """package com.costpilot.expense.adapter.persistence;
import com.costpilot.expense.domain.OverheadExpense;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JpaOverheadExpenseRepository extends JpaRepository<OverheadExpense, Long> {}
"""

files[r"budget\adapter\persistence\JpaStandardCostRateRepository.java"] = """package com.costpilot.budget.adapter.persistence;
import com.costpilot.budget.domain.StandardCostRate;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JpaStandardCostRateRepository extends JpaRepository<StandardCostRate, Long> {}
"""

files[r"budget\adapter\persistence\JpaBudgetPlanRepository.java"] = """package com.costpilot.budget.adapter.persistence;
import com.costpilot.budget.domain.BudgetPlan;
import org.springframework.data.jpa.repository.JpaRepository;
public interface JpaBudgetPlanRepository extends JpaRepository<BudgetPlan, Long> {}
"""

for path, content in files.items():
    full_path = os.path.join(base_path, path)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

print("Files generated.")

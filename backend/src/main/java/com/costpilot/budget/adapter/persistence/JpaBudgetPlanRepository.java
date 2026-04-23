package com.costpilot.budget.adapter.persistence;

import com.costpilot.budget.domain.BudgetPlan;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaBudgetPlanRepository extends JpaRepository<BudgetPlan, Long> {
}

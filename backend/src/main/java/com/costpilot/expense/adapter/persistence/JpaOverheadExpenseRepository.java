package com.costpilot.expense.adapter.persistence;

import com.costpilot.expense.domain.OverheadExpense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaOverheadExpenseRepository extends JpaRepository<OverheadExpense, Long> {
}

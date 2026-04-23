package com.costpilot.expense.adapter.persistence;

import com.costpilot.expense.domain.DirectExpense;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaDirectExpenseRepository extends JpaRepository<DirectExpense, Long> {
}

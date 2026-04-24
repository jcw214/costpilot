package com.costpilot.expense.adapter.web.dto;

import com.costpilot.expense.domain.OverheadExpense;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class OverheadExpenseResponse {
    private final Long id;
    private final Long departmentId;
    private final String departmentName;
    private final String costCategory;
    private final Long amount;
    private final LocalDate costMonth;

    public OverheadExpenseResponse(OverheadExpense expense) {
        this.id = expense.getId();
        this.departmentId = expense.getDepartment().getId();
        this.departmentName = expense.getDepartment().getName();
        this.costCategory = expense.getCostCategory();
        this.amount = expense.getAmount();
        this.costMonth = expense.getCostMonth();
    }
}

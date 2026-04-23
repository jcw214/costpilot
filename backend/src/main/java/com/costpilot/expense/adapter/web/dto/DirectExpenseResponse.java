package com.costpilot.expense.adapter.web.dto;

import com.costpilot.expense.domain.DirectExpense;
import lombok.Getter;
import java.time.LocalDate;

@Getter
public class DirectExpenseResponse {
    private final Long id;
    private final Long projectId;
    private final String projectName;
    private final String costType;
    private final String vendorName;
    private final String description;
    private final Long amount;
    private final LocalDate costDate;

    public DirectExpenseResponse(DirectExpense expense) {
        this.id = expense.getId();
        this.projectId = expense.getProject().getId();
        this.projectName = expense.getProject().getName();
        this.costType = expense.getCostType();
        this.vendorName = expense.getVendorName();
        this.description = expense.getDescription();
        this.amount = expense.getAmount();
        this.costDate = expense.getCostDate();
    }
}

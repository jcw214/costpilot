package com.costpilot.expense.port.in;

import com.costpilot.expense.adapter.web.dto.DirectExpenseResponse;
import com.costpilot.expense.adapter.web.dto.OverheadExpenseResponse;
import java.util.List;

public interface ExpenseQueryUseCase {
    List<DirectExpenseResponse> getAllDirectExpenses();
    List<OverheadExpenseResponse> getAllOverheadExpenses();
}

package com.costpilot.expense.adapter.web;

import com.costpilot.expense.adapter.web.dto.DirectExpenseResponse;
import com.costpilot.expense.adapter.web.dto.OverheadExpenseResponse;
import com.costpilot.expense.port.in.ExpenseQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseQueryUseCase expenseQueryUseCase;

    @GetMapping("/api/project-direct-costs")
    public ResponseEntity<List<DirectExpenseResponse>> getAllDirectExpenses() {
        return ResponseEntity.ok(expenseQueryUseCase.getAllDirectExpenses());
    }

    @GetMapping("/api/overhead-costs")
    public ResponseEntity<List<OverheadExpenseResponse>> getAllOverheadExpenses() {
        return ResponseEntity.ok(expenseQueryUseCase.getAllOverheadExpenses());
    }
}

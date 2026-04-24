package com.costpilot.expense.service;

import com.costpilot.expense.adapter.persistence.JpaDirectExpenseRepository;
import com.costpilot.expense.adapter.persistence.JpaOverheadExpenseRepository;
import com.costpilot.expense.adapter.web.dto.DirectExpenseResponse;
import com.costpilot.expense.adapter.web.dto.OverheadExpenseResponse;
import com.costpilot.expense.port.in.ExpenseQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ExpenseQueryService implements ExpenseQueryUseCase {

    private final JpaDirectExpenseRepository jpaDirectExpenseRepository;
    private final JpaOverheadExpenseRepository jpaOverheadExpenseRepository;

    @Override
    public List<DirectExpenseResponse> getAllDirectExpenses() {
        return jpaDirectExpenseRepository.findAll().stream()
                .map(DirectExpenseResponse::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<OverheadExpenseResponse> getAllOverheadExpenses() {
        return jpaOverheadExpenseRepository.findAll().stream()
                .map(OverheadExpenseResponse::new)
                .collect(Collectors.toList());
    }
}

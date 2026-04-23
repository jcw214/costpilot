package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.EmployeeResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final OrganizationQueryUseCase organizationQueryUseCase;

    @GetMapping
    public List<EmployeeResponse> getEmployees(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long jobGradeId) {
        return organizationQueryUseCase.getEmployees(departmentId, jobGradeId);
    }
}

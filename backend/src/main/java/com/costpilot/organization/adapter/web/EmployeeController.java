package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.EmployeeResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PatchMapping("/{id}")
    public EmployeeResponse updateHourlyRate(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        Integer hourlyRate = request.get("hourlyRate");
        return organizationQueryUseCase.updateEmployeeHourlyRate(id, hourlyRate);
    }
}

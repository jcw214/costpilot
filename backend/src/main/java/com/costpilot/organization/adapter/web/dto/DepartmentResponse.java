package com.costpilot.organization.adapter.web.dto;

public record DepartmentResponse(
        Long id,
        String name,
        String type,
        int employeeCount
) {
}

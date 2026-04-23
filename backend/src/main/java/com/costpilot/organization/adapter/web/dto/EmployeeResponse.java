package com.costpilot.organization.adapter.web.dto;

public record EmployeeResponse(
        Long id,
        String name,
        String departmentName,
        String jobGradeCode,
        String jobGradeName,
        Integer hourlyRate,
        Integer standardHourlyRate
) {
}

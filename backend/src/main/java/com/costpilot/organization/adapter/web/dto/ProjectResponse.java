package com.costpilot.organization.adapter.web.dto;

import java.time.LocalDate;

public record ProjectResponse(
        Long id,
        String name,
        String departmentName,
        String projectTypeName,
        String status,
        Long contractAmount,
        LocalDate startDate,
        LocalDate endDate
) {
}

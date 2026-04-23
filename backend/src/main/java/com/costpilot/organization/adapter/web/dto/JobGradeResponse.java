package com.costpilot.organization.adapter.web.dto;

public record JobGradeResponse(
        Long id,
        String code,
        String name,
        Integer standardHourlyRate
) {
}

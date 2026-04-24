package com.costpilot.budget.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class StandardCostRateResponse {
    private Long id;
    private String projectTypeName;
    private String jobGradeName;
    private int standardHourlyRate;
    private double standardHours;
    private long standardCost;
}

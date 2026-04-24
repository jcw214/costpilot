package com.costpilot.dashboard.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class DashboardSummaryResponse {

    private long totalRevenue;
    private long totalCost;
    private double operatingMarginRate;
    private double averageUtilization;
    private List<DepartmentContribution> departmentContributions;
    private List<ProjectProfitability> projectProfitabilities;

    @Getter
    @Builder
    public static class DepartmentContribution {
        private String departmentName;
        private long revenue;
        private long cost;
        private long contribution;
    }

    @Getter
    @Builder
    public static class ProjectProfitability {
        private String projectName;
        private String departmentName;
        private long contractAmount;
        private long actualCost;
        private long profit;
        private double profitRate;
    }
}

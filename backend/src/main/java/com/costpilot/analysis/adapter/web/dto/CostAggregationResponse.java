package com.costpilot.analysis.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CostAggregationResponse {
    private Long companyTotalCost;
    private List<DepartmentCostDto> departments;

    @Getter
    @Builder
    public static class DepartmentCostDto {
        private String departmentName;
        private Long totalCost;
        private List<ProjectCostDto> projects;
    }

    @Getter
    @Builder
    public static class ProjectCostDto {
        private String projectName;
        private Long directExpense;
        private Long laborCost;
        private Long totalProjectCost;
        private List<EmployeeCostDto> employees;
    }

    @Getter
    @Builder
    public static class EmployeeCostDto {
        private String employeeName;
        private Long hours;
        private Long laborCost;
    }
}

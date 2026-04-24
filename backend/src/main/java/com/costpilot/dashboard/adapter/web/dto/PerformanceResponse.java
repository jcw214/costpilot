package com.costpilot.dashboard.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class PerformanceResponse {

    private List<DepartmentPerformance> departmentPerformances;
    private List<ProjectPerformance> projectPerformances;
    private List<EmployeeUtilization> employeeUtilizations;

    @Getter
    @Builder
    public static class DepartmentPerformance {
        private String departmentName;
        private long revenue;
        private long cost;
        private long profit;
        private double profitRate;
        private int employeeCount;
        private double avgUtilization;
    }

    @Getter
    @Builder
    public static class ProjectPerformance {
        private String projectName;
        private String departmentName;
        private long contractAmount;
        private long laborCost;
        private long directExpense;
        private long totalCost;
        private long profit;
        private double profitRate;
        private double totalHours;
    }

    @Getter
    @Builder
    public static class EmployeeUtilization {
        private String employeeName;
        private String departmentName;
        private String jobGradeName;
        private double totalHours;
        private double standardHours;
        private double utilizationRate;
    }
}

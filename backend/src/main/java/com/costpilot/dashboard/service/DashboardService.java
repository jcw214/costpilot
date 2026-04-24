package com.costpilot.dashboard.service;

import com.costpilot.budget.adapter.persistence.JpaStandardCostRateRepository;
import com.costpilot.budget.domain.StandardCostRate;
import com.costpilot.dashboard.adapter.web.dto.DashboardSummaryResponse;
import com.costpilot.dashboard.adapter.web.dto.PerformanceResponse;
import com.costpilot.dashboard.port.in.DashboardUseCase;
import com.costpilot.expense.adapter.persistence.JpaDirectExpenseRepository;
import com.costpilot.expense.adapter.persistence.JpaOverheadExpenseRepository;
import com.costpilot.expense.domain.DirectExpense;
import com.costpilot.expense.domain.OverheadExpense;
import com.costpilot.organization.domain.*;
import com.costpilot.organization.port.out.EmployeeRepository;
import com.costpilot.organization.port.out.ProjectRepository;
import com.costpilot.timesheet.adapter.persistence.JpaTimeEntryRepository;
import com.costpilot.timesheet.domain.TimeEntry;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService implements DashboardUseCase {

    private final ProjectRepository projectRepository;
    private final EmployeeRepository employeeRepository;
    private final JpaTimeEntryRepository timeEntryRepository;
    private final JpaDirectExpenseRepository directExpenseRepository;
    private final JpaOverheadExpenseRepository overheadExpenseRepository;
    private final JpaStandardCostRateRepository standardCostRateRepository;

    @Override
    public DashboardSummaryResponse getDashboardSummary() {
        List<Project> projects = projectRepository.findAll();
        List<TimeEntry> allEntries = timeEntryRepository.findAll();
        List<DirectExpense> allDirect = directExpenseRepository.findAll();
        List<OverheadExpense> allOverhead = overheadExpenseRepository.findAll();
        List<StandardCostRate> rates = standardCostRateRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();

        // 프로젝트별 실제원가 계산
        Map<Long, Long> laborByProject = computeLaborByProject(allEntries);
        Map<Long, Long> directByProject = allDirect.stream()
                .collect(Collectors.groupingBy(e -> e.getProject().getId(), Collectors.summingLong(DirectExpense::getAmount)));

        // 전사 매출
        long totalRevenue = projects.stream().mapToLong(Project::getContractAmount).sum();

        // 전사 총원가 (노무비 + 직접비 + 간접비)
        long totalLabor = laborByProject.values().stream().mapToLong(Long::longValue).sum();
        long totalDirect = directByProject.values().stream().mapToLong(Long::longValue).sum();
        long totalOverhead = allOverhead.stream().mapToLong(OverheadExpense::getAmount).sum();
        long totalCost = totalLabor + totalDirect + totalOverhead;

        // 영업이익률
        double operatingMarginRate = totalRevenue > 0 ? Math.round((double)(totalRevenue - totalCost) / totalRevenue * 10000) / 100.0 : 0;

        // 가동률: 실제투입시간 / 표준투입시간
        double totalActualHours = allEntries.stream().mapToDouble(t -> t.getHours().doubleValue()).sum();
        double totalStdHoursPerProject = rates.stream().mapToDouble(r -> r.getStandardHours().doubleValue()).sum();
        long revenueProjectCount = projects.stream()
                .filter(p -> p.getDepartment().getType() == DepartmentType.수익).count();
        long projectTypeCount = Math.max(rates.stream().map(r -> r.getProjectType().getId()).distinct().count(), 1);
        double totalStdHours = totalStdHoursPerProject * revenueProjectCount / projectTypeCount;
        double avgUtilization = totalStdHours > 0 ? Math.round(totalActualHours / totalStdHours * 10000) / 100.0 : 0;

        // 본부별 공헌이익
        Map<String, List<Project>> projectsByDept = projects.stream()
                .filter(p -> p.getDepartment().getType() == DepartmentType.수익)
                .collect(Collectors.groupingBy(p -> p.getDepartment().getName()));

        List<DashboardSummaryResponse.DepartmentContribution> deptContribs = new ArrayList<>();
        for (Map.Entry<String, List<Project>> entry : projectsByDept.entrySet()) {
            long deptRevenue = entry.getValue().stream().mapToLong(Project::getContractAmount).sum();
            long deptCost = 0;
            for (Project p : entry.getValue()) {
                deptCost += laborByProject.getOrDefault(p.getId(), 0L);
                deptCost += directByProject.getOrDefault(p.getId(), 0L);
            }
            deptContribs.add(DashboardSummaryResponse.DepartmentContribution.builder()
                    .departmentName(entry.getKey())
                    .revenue(deptRevenue)
                    .cost(deptCost)
                    .contribution(deptRevenue - deptCost)
                    .build());
        }
        deptContribs.sort((a, b) -> Long.compare(b.getContribution(), a.getContribution()));

        // 프로젝트 수익성 분포
        List<DashboardSummaryResponse.ProjectProfitability> projProfits = new ArrayList<>();
        for (Project p : projects) {
            if (p.getDepartment().getType() != DepartmentType.수익) continue;
            long pCost = laborByProject.getOrDefault(p.getId(), 0L) + directByProject.getOrDefault(p.getId(), 0L);
            long pProfit = p.getContractAmount() - pCost;
            double pProfitRate = p.getContractAmount() > 0
                    ? Math.round((double) pProfit / p.getContractAmount() * 10000) / 100.0 : 0;
            projProfits.add(DashboardSummaryResponse.ProjectProfitability.builder()
                    .projectName(p.getName())
                    .departmentName(p.getDepartment().getName())
                    .contractAmount(p.getContractAmount())
                    .actualCost(pCost)
                    .profit(pProfit)
                    .profitRate(pProfitRate)
                    .build());
        }
        projProfits.sort((a, b) -> Double.compare(b.getProfitRate(), a.getProfitRate()));

        return DashboardSummaryResponse.builder()
                .totalRevenue(totalRevenue)
                .totalCost(totalCost)
                .operatingMarginRate(operatingMarginRate)
                .averageUtilization(avgUtilization)
                .departmentContributions(deptContribs)
                .projectProfitabilities(projProfits)
                .build();
    }

    @Override
    public PerformanceResponse getPerformanceAnalysis() {
        List<Project> projects = projectRepository.findAll();
        List<Employee> allEmployees = employeeRepository.findAll();
        List<TimeEntry> allEntries = timeEntryRepository.findAll();
        List<DirectExpense> allDirect = directExpenseRepository.findAll();
        List<StandardCostRate> rates = standardCostRateRepository.findAll();

        Map<Long, Long> laborByProject = computeLaborByProject(allEntries);
        Map<Long, Long> directByProject = allDirect.stream()
                .collect(Collectors.groupingBy(e -> e.getProject().getId(), Collectors.summingLong(DirectExpense::getAmount)));
        Map<Long, Double> hoursByProject = allEntries.stream()
                .collect(Collectors.groupingBy(t -> t.getProject().getId(),
                        Collectors.summingDouble(t -> t.getHours().doubleValue())));

        // 본부별 성과
        Map<String, List<Project>> projectsByDept = projects.stream()
                .filter(p -> p.getDepartment().getType() == DepartmentType.수익)
                .collect(Collectors.groupingBy(p -> p.getDepartment().getName()));

        // 표준공수(전체의 프로젝트 평균)
        double totalStdHoursPerType = rates.stream().mapToDouble(r -> r.getStandardHours().doubleValue()).sum();
        long projectTypeCount = Math.max(rates.stream().map(r -> r.getProjectType().getId()).distinct().count(), 1);
        double stdHoursPerProject = totalStdHoursPerType / projectTypeCount;

        List<PerformanceResponse.DepartmentPerformance> deptPerfs = new ArrayList<>();
        for (Map.Entry<String, List<Project>> entry : projectsByDept.entrySet()) {
            long deptRevenue = entry.getValue().stream().mapToLong(Project::getContractAmount).sum();
            long deptLaborCost = 0;
            long deptDirectCost = 0;
            double deptHours = 0;
            for (Project p : entry.getValue()) {
                deptLaborCost += laborByProject.getOrDefault(p.getId(), 0L);
                deptDirectCost += directByProject.getOrDefault(p.getId(), 0L);
                deptHours += hoursByProject.getOrDefault(p.getId(), 0.0);
            }
            long deptCost = deptLaborCost + deptDirectCost;
            long deptProfit = deptRevenue - deptCost;
            double deptProfitRate = deptRevenue > 0 ? Math.round((double) deptProfit / deptRevenue * 10000) / 100.0 : 0;

            int empCount = (int) allEmployees.stream()
                    .filter(e -> e.getDepartment().getName().equals(entry.getKey())).count();
            double deptStdHours = stdHoursPerProject * entry.getValue().size();
            double avgUtil = deptStdHours > 0 ? Math.round(deptHours / deptStdHours * 10000) / 100.0 : 0;

            deptPerfs.add(PerformanceResponse.DepartmentPerformance.builder()
                    .departmentName(entry.getKey())
                    .revenue(deptRevenue)
                    .cost(deptCost)
                    .profit(deptProfit)
                    .profitRate(deptProfitRate)
                    .employeeCount(empCount)
                    .avgUtilization(avgUtil)
                    .build());
        }

        // 프로젝트별 성과
        List<PerformanceResponse.ProjectPerformance> projPerfs = new ArrayList<>();
        for (Project p : projects) {
            if (p.getDepartment().getType() != DepartmentType.수익) continue;
            long pLabor = laborByProject.getOrDefault(p.getId(), 0L);
            long pDirect = directByProject.getOrDefault(p.getId(), 0L);
            long pTotal = pLabor + pDirect;
            long pProfit = p.getContractAmount() - pTotal;
            double pProfitRate = p.getContractAmount() > 0
                    ? Math.round((double) pProfit / p.getContractAmount() * 10000) / 100.0 : 0;
            double pHours = hoursByProject.getOrDefault(p.getId(), 0.0);

            projPerfs.add(PerformanceResponse.ProjectPerformance.builder()
                    .projectName(p.getName())
                    .departmentName(p.getDepartment().getName())
                    .contractAmount(p.getContractAmount())
                    .laborCost(pLabor)
                    .directExpense(pDirect)
                    .totalCost(pTotal)
                    .profit(pProfit)
                    .profitRate(pProfitRate)
                    .totalHours(pHours)
                    .build());
        }

        // 인력별 가동률
        Map<Long, Double> hoursByEmployee = allEntries.stream()
                .collect(Collectors.groupingBy(t -> t.getEmployee().getId(),
                        Collectors.summingDouble(t -> t.getHours().doubleValue())));

        // 총 표준 시간 = 표준공수 합계 (직급별 × 프로젝트 유형별)
        // 인력당 표준시간 ≈ 해당 직급의 표준공수 합
        Map<Long, Double> stdHoursByGrade = rates.stream()
                .collect(Collectors.groupingBy(r -> r.getJobGrade().getId(),
                        Collectors.summingDouble(r -> r.getStandardHours().doubleValue())));

        List<PerformanceResponse.EmployeeUtilization> empUtils = new ArrayList<>();
        for (Employee emp : allEmployees) {
            if (emp.getDepartment().getType() != DepartmentType.수익) continue;
            double actual = hoursByEmployee.getOrDefault(emp.getId(), 0.0);
            double std = stdHoursByGrade.getOrDefault(emp.getJobGrade().getId(), 0.0);
            double utilRate = std > 0 ? Math.round(actual / std * 10000) / 100.0 : 0;

            empUtils.add(PerformanceResponse.EmployeeUtilization.builder()
                    .employeeName(emp.getName())
                    .departmentName(emp.getDepartment().getName())
                    .jobGradeName(emp.getJobGrade().getName())
                    .totalHours(Math.round(actual * 10) / 10.0)
                    .standardHours(Math.round(std * 10) / 10.0)
                    .utilizationRate(utilRate)
                    .build());
        }
        empUtils.sort((a, b) -> Double.compare(b.getUtilizationRate(), a.getUtilizationRate()));

        return PerformanceResponse.builder()
                .departmentPerformances(deptPerfs)
                .projectPerformances(projPerfs)
                .employeeUtilizations(empUtils)
                .build();
    }

    private Map<Long, Long> computeLaborByProject(List<TimeEntry> entries) {
        Map<Long, Long> result = new HashMap<>();
        entries.stream()
                .collect(Collectors.groupingBy(t -> t.getProject().getId()))
                .forEach((pid, tList) -> {
                    long labor = tList.stream()
                            .mapToLong(t -> (long)(t.getEmployee().getHourlyRate() * t.getHours().doubleValue()))
                            .sum();
                    result.put(pid, labor);
                });
        return result;
    }
}

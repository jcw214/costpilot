package com.costpilot.analysis.service;

import com.costpilot.analysis.adapter.web.dto.*;
import com.costpilot.analysis.domain.CostDriver;
import com.costpilot.analysis.domain.PricingMethod;
import com.costpilot.analysis.port.in.AnalysisUseCase;
import com.costpilot.budget.adapter.persistence.JpaBudgetPlanRepository;
import com.costpilot.budget.adapter.persistence.JpaStandardCostRateRepository;
import com.costpilot.budget.domain.BudgetPlan;
import com.costpilot.budget.domain.StandardCostRate;
import com.costpilot.expense.adapter.persistence.JpaDirectExpenseRepository;
import com.costpilot.expense.adapter.persistence.JpaOverheadExpenseRepository;
import com.costpilot.expense.domain.DirectExpense;
import com.costpilot.expense.domain.OverheadExpense;
import com.costpilot.organization.adapter.persistence.JpaDepartmentRepository;
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
public class AnalysisService implements AnalysisUseCase {

    private final JpaDepartmentRepository departmentRepository;
    private final JpaDirectExpenseRepository directExpenseRepository;
    private final JpaTimeEntryRepository timeEntryRepository;
    private final JpaOverheadExpenseRepository overheadExpenseRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final JpaStandardCostRateRepository standardCostRateRepository;
    private final JpaBudgetPlanRepository budgetPlanRepository;

    @Override
    public CostAggregationResponse aggregateCosts() {
        List<TimeEntry> allTimeEntries = timeEntryRepository.findAll();
        List<DirectExpense> allDirectExpenses = directExpenseRepository.findAll();

        Map<Long, List<TimeEntry>> timeEntriesByProject = allTimeEntries.stream()
                .collect(Collectors.groupingBy(e -> e.getProject().getId()));
        
        Map<Long, List<DirectExpense>> directExpensesByProject = allDirectExpenses.stream()
                .collect(Collectors.groupingBy(e -> e.getProject().getId()));

        Set<Project> allProjects = new HashSet<>();
        allTimeEntries.forEach(t -> allProjects.add(t.getProject()));
        allDirectExpenses.forEach(d -> allProjects.add(d.getProject()));

        Map<Department, List<Project>> projectsByDept = allProjects.stream()
                .collect(Collectors.groupingBy(Project::getDepartment));

        long companyTotalCost = 0L;
        List<CostAggregationResponse.DepartmentCostDto> departmentDtos = new ArrayList<>();

        for (Map.Entry<Department, List<Project>> deptEntry : projectsByDept.entrySet()) {
            Department dept = deptEntry.getKey();
            long deptTotalCost = 0L;
            List<CostAggregationResponse.ProjectCostDto> projectDtos = new ArrayList<>();

            for (Project proj : deptEntry.getValue()) {
                List<TimeEntry> tEntries = timeEntriesByProject.getOrDefault(proj.getId(), Collections.emptyList());
                List<DirectExpense> dExpenses = directExpensesByProject.getOrDefault(proj.getId(), Collections.emptyList());

                long directTotal = dExpenses.stream().mapToLong(DirectExpense::getAmount).sum();
                
                Map<Employee, List<TimeEntry>> byEmp = tEntries.stream()
                        .collect(Collectors.groupingBy(TimeEntry::getEmployee));
                        
                long laborTotal = 0L;
                List<CostAggregationResponse.EmployeeCostDto> empDtos = new ArrayList<>();
                for(Map.Entry<Employee, List<TimeEntry>> empEntry : byEmp.entrySet()) {
                    Employee emp = empEntry.getKey();
                    long empHours = empEntry.getValue().stream()
                            .map(TimeEntry::getHours)
                            .mapToLong(BigDecimal::longValue)
                            .sum();
                    long empLabor = empHours * emp.getHourlyRate();
                    laborTotal += empLabor;
                    empDtos.add(CostAggregationResponse.EmployeeCostDto.builder()
                            .employeeName(emp.getName())
                            .hours(empHours)
                            .laborCost(empLabor)
                            .build());
                }
                
                long projTotal = directTotal + laborTotal;
                deptTotalCost += projTotal;
                projectDtos.add(CostAggregationResponse.ProjectCostDto.builder()
                        .projectName(proj.getName())
                        .directExpense(directTotal)
                        .laborCost(laborTotal)
                        .totalProjectCost(projTotal)
                        .employees(empDtos)
                        .build());
            }
            
            companyTotalCost += deptTotalCost;
            departmentDtos.add(CostAggregationResponse.DepartmentCostDto.builder()
                    .departmentName(dept.getName())
                    .totalCost(deptTotalCost)
                    .projects(projectDtos)
                    .build());
        }

        return CostAggregationResponse.builder()
                .companyTotalCost(companyTotalCost)
                .departments(departmentDtos)
                .build();
    }

    @Override
    public List<TransferPricingResponse> calculateTransferPricing(PricingMethod method, CostDriver driver) {
        List<OverheadExpense> allOverhead = overheadExpenseRepository.findAll();
        Map<Department, Long> overheadBySupportDept = allOverhead.stream()
                .collect(Collectors.groupingBy(OverheadExpense::getDepartment, Collectors.summingLong(OverheadExpense::getAmount)));

        List<Department> revenueDepts = departmentRepository.findAll().stream()
                .filter(d -> d.getType() == DepartmentType.수익)
                .collect(Collectors.toList());

        if (revenueDepts.isEmpty()) return new ArrayList<>();

        // ── 배부 기준(Cost Driver)별 비율 계산 ──
        Map<Long, Double> driverValues = new LinkedHashMap<>();
        double totalDriverValue = 0;

        switch (driver) {
            case HEADCOUNT -> {
                List<Employee> allEmployees = employeeRepository.findAll();
                for (Department dept : revenueDepts) {
                    long count = allEmployees.stream()
                            .filter(e -> e.getDepartment().getId().equals(dept.getId()))
                            .count();
                    driverValues.put(dept.getId(), (double) count);
                    totalDriverValue += count;
                }
            }
            case REVENUE -> {
                List<Project> allProjects = projectRepository.findAll();
                for (Department dept : revenueDepts) {
                    long revenue = allProjects.stream()
                            .filter(p -> p.getDepartment().getId().equals(dept.getId()))
                            .mapToLong(Project::getContractAmount)
                            .sum();
                    driverValues.put(dept.getId(), (double) revenue);
                    totalDriverValue += revenue;
                }
            }
            case LABOR_HOURS -> {
                List<TimeEntry> allEntries = timeEntryRepository.findAll();
                for (Department dept : revenueDepts) {
                    double hours = allEntries.stream()
                            .filter(t -> t.getProject().getDepartment().getId().equals(dept.getId()))
                            .map(TimeEntry::getHours)
                            .mapToDouble(BigDecimal::doubleValue)
                            .sum();
                    driverValues.put(dept.getId(), hours);
                    totalDriverValue += hours;
                }
            }
        }

        // ── 비율 산출 ──
        Map<Long, Double> ratios = new LinkedHashMap<>();
        for (Map.Entry<Long, Double> e : driverValues.entrySet()) {
            ratios.put(e.getKey(), totalDriverValue > 0 ? e.getValue() / totalDriverValue : 0);
        }

        // ── 배부 계산 ──
        double multiplier = method.getMultiplier();
        List<TransferPricingResponse> responses = new ArrayList<>();

        for (Map.Entry<Department, Long> entry : overheadBySupportDept.entrySet()) {
            Department supportDept = entry.getKey();
            long baseCost = entry.getValue();
            long allocatedTotal = (long) (baseCost * multiplier);

            List<TransferPricingResponse.AllocationDto> allocations = new ArrayList<>();
            for (Department revDept : revenueDepts) {
                double ratio = ratios.getOrDefault(revDept.getId(), 0.0);
                long amount = (long) (allocatedTotal * ratio);
                allocations.add(TransferPricingResponse.AllocationDto.builder()
                        .revenueDepartmentName(revDept.getName())
                        .driverRatio(Math.round(ratio * 10000) / 100.0)
                        .allocatedAmount(amount)
                        .build());
            }

            responses.add(TransferPricingResponse.builder()
                    .supportDepartmentName(supportDept.getName())
                    .totalOverheadCost(baseCost)
                    .pricingMethod(method.name())
                    .costDriver(driver.name())
                    .allocations(allocations)
                    .build());
        }
        return responses;
    }

    // ══════════════════════════════════════════════════════════
    // M3: 표준원가 배분
    // ══════════════════════════════════════════════════════════

    @Override
    public StandardCostResponse getStandardCostAnalysis(CostDriver driver) {
        List<StandardCostRate> rates = standardCostRateRepository.findAll();
        List<Project> projects = projectRepository.findAll();
        List<TimeEntry> allEntries = timeEntryRepository.findAll();
        List<DirectExpense> allExpenses = directExpenseRepository.findAll();
        List<OverheadExpense> allOverhead = overheadExpenseRepository.findAll();

        // ── STD-BASE: 표준원가 기준 테이블 ──
        List<StandardCostResponse.StandardRateDto> rateDtos = rates.stream()
                .map(r -> StandardCostResponse.StandardRateDto.builder()
                        .projectTypeName(r.getProjectType().getName())
                        .jobGradeName(r.getJobGrade().getName())
                        .standardHourlyRate(r.getJobGrade().getStandardHourlyRate())
                        .standardHours(r.getStandardHours().doubleValue())
                        .standardCost((long)(r.getJobGrade().getStandardHourlyRate() * r.getStandardHours().doubleValue()))
                        .build())
                .collect(Collectors.toList());

        // ── 프로젝트별 표준원가 계산 ──
        Map<Long, Long> stdCostByProject = new HashMap<>();
        for (Project p : projects) {
            long stdCost = rates.stream()
                    .filter(r -> r.getProjectType().getId().equals(p.getProjectType().getId()))
                    .mapToLong(r -> (long)(r.getJobGrade().getStandardHourlyRate() * r.getStandardHours().doubleValue()))
                    .sum();
            stdCostByProject.put(p.getId(), stdCost);
        }

        // ── 간접원가 총액 및 배부 비율 (M2와 동일한 Driver 로직 재활용) ──
        long totalOverhead = allOverhead.stream().mapToLong(OverheadExpense::getAmount).sum();
        List<Department> revenueDepts = departmentRepository.findAll().stream()
                .filter(d -> d.getType() == DepartmentType.수익).collect(Collectors.toList());
        Map<Long, Double> deptRatios = computeDriverRatios(driver, revenueDepts);

        // ── STD-ALLOC: 프로젝트별 배분 결과 ──
        List<StandardCostResponse.ProjectAllocationDto> allocDtos = new ArrayList<>();
        for (Project p : projects) {
            if (p.getDepartment().getType() != DepartmentType.수익) continue;
            long stdCost = stdCostByProject.getOrDefault(p.getId(), 0L);
            double deptRatio = deptRatios.getOrDefault(p.getDepartment().getId(), 0.0);
            // 본부에 배분된 간접비를 다시 본부 내 프로젝트 매출 비율로 재배분
            long deptOverhead = (long)(totalOverhead * deptRatio);
            long deptRevenue = projects.stream()
                    .filter(pp -> pp.getDepartment().getId().equals(p.getDepartment().getId()))
                    .mapToLong(Project::getContractAmount).sum();
            double projShare = deptRevenue > 0 ? (double) p.getContractAmount() / deptRevenue : 0;
            long allocOverhead = (long)(deptOverhead * projShare);

            allocDtos.add(StandardCostResponse.ProjectAllocationDto.builder()
                    .projectName(p.getName())
                    .departmentName(p.getDepartment().getName())
                    .standardCost(stdCost)
                    .allocatedOverhead(allocOverhead)
                    .totalStandardCost(stdCost + allocOverhead)
                    .build());
        }

        // ── STD-COMPARE: 표준 vs. 실제 비교 ──
        Map<Long, Long> actualCostByProject = computeActualCostByProject(allEntries, allExpenses);
        List<StandardCostResponse.ProjectComparisonDto> compDtos = new ArrayList<>();
        for (Project p : projects) {
            if (p.getDepartment().getType() != DepartmentType.수익) continue;
            long stdCost = stdCostByProject.getOrDefault(p.getId(), 0L);
            long actualCost = actualCostByProject.getOrDefault(p.getId(), 0L);
            long variance = actualCost - stdCost;
            double varianceRate = stdCost > 0 ? Math.round((double) variance / stdCost * 10000) / 100.0 : 0;

            compDtos.add(StandardCostResponse.ProjectComparisonDto.builder()
                    .projectName(p.getName())
                    .departmentName(p.getDepartment().getName())
                    .standardCost(stdCost)
                    .actualCost(actualCost)
                    .variance(variance)
                    .varianceRate(varianceRate)
                    .verdict(variance > 0 ? "U" : "F")
                    .build());
        }

        return StandardCostResponse.builder()
                .standardRates(rateDtos)
                .projectAllocations(allocDtos)
                .comparisons(compDtos)
                .build();
    }

    // ══════════════════════════════════════════════════════════
    // M4: 원가 요인 분석
    // ══════════════════════════════════════════════════════════

    @Override
    public VarianceAnalysisResponse getVarianceAnalysis() {
        List<TimeEntry> allEntries = timeEntryRepository.findAll();
        List<DirectExpense> allExpenses = directExpenseRepository.findAll();
        List<OverheadExpense> allOverhead = overheadExpenseRepository.findAll();
        List<StandardCostRate> rates = standardCostRateRepository.findAll();
        List<BudgetPlan> budgets = budgetPlanRepository.findAll();
        List<Project> projects = projectRepository.findAll();

        Map<Long, List<TimeEntry>> entriesByProject = allEntries.stream()
                .collect(Collectors.groupingBy(t -> t.getProject().getId()));
        Map<Long, List<DirectExpense>> expensesByProject = allExpenses.stream()
                .collect(Collectors.groupingBy(e -> e.getProject().getId()));

        // ── VAR-LABOR: 직접노무비 차이 분석 ──
        List<VarianceAnalysisResponse.LaborVarianceDto> laborDtos = new ArrayList<>();
        for (Project p : projects) {
            if (p.getDepartment().getType() != DepartmentType.수익) continue;
            List<TimeEntry> pEntries = entriesByProject.getOrDefault(p.getId(), Collections.emptyList());
            if (pEntries.isEmpty()) continue;

            // 실제노무비 = Σ(실제시급 × 실제시간)
            long actualLabor = 0;
            double totalActualHours = 0;
            for (TimeEntry t : pEntries) {
                double hrs = t.getHours().doubleValue();
                totalActualHours += hrs;
                actualLabor += (long)(t.getEmployee().getHourlyRate() * hrs);
            }

            // 표준노무비 = Σ(표준시급 × 표준공수) for this project type
            long standardLabor = rates.stream()
                    .filter(r -> r.getProjectType().getId().equals(p.getProjectType().getId()))
                    .mapToLong(r -> (long)(r.getJobGrade().getStandardHourlyRate() * r.getStandardHours().doubleValue()))
                    .sum();
            double totalStdHours = rates.stream()
                    .filter(r -> r.getProjectType().getId().equals(p.getProjectType().getId()))
                    .mapToDouble(r -> r.getStandardHours().doubleValue()).sum();

            // 가중평균 표준임률, 실제임률
            double avgStdRate = totalStdHours > 0 ? (double) standardLabor / totalStdHours : 0;
            double avgActualRate = totalActualHours > 0 ? (double) actualLabor / totalActualHours : 0;

            // 임률차이 = (실제임률 - 표준임률) × 실제시간
            long rateVar = (long)((avgActualRate - avgStdRate) * totalActualHours);
            // 능률차이 = (실제시간 - 표준허용시간) × 표준임률
            long effVar = (long)((totalActualHours - totalStdHours) * avgStdRate);
            long totalVar = rateVar + effVar;

            laborDtos.add(VarianceAnalysisResponse.LaborVarianceDto.builder()
                    .projectName(p.getName())
                    .departmentName(p.getDepartment().getName())
                    .standardLaborCost(standardLabor)
                    .actualLaborCost(actualLabor)
                    .rateVariance(rateVar).rateVerdict(rateVar > 0 ? "U" : "F")
                    .efficiencyVariance(effVar).efficiencyVerdict(effVar > 0 ? "U" : "F")
                    .totalVariance(totalVar).totalVerdict(totalVar > 0 ? "U" : "F")
                    .build());
        }

        // ── VAR-OVERHEAD: 간접원가 차이 분석 (전사 3분법) ──
        long actualOH = allOverhead.stream().mapToLong(OverheadExpense::getAmount).sum();
        double totalActualHoursAll = allEntries.stream().mapToDouble(t -> t.getHours().doubleValue()).sum();
        double totalStdHoursAll = rates.stream().mapToDouble(r -> r.getStandardHours().doubleValue()).sum()
                * projects.stream().filter(p -> p.getDepartment().getType() == DepartmentType.수익).count() / Math.max(rates.stream().map(r -> r.getProjectType().getId()).distinct().count(), 1);

        // 변동간접비 배부율 (간접비의 60%를 변동, 40%를 고정으로 가정)
        double variableRatio = 0.6;
        long variableOH = (long)(actualOH * variableRatio);
        long fixedOH = actualOH - variableOH;
        double varOHRate = totalStdHoursAll > 0 ? (double) variableOH / totalStdHoursAll : 0;
        double fixedOHRate = totalStdHoursAll > 0 ? (double) fixedOH / totalStdHoursAll : 0;
        double normalCapacity = totalStdHoursAll; // 정상조업도 = 표준시간

        long budgetAllowance = (long)(varOHRate * totalActualHoursAll + fixedOH);
        long spendingVar = actualOH - budgetAllowance;
        long ohEffVar = (long)((totalActualHoursAll - totalStdHoursAll) * varOHRate);
        long volumeVar = (long)((totalActualHoursAll - normalCapacity) * fixedOHRate);
        long ohTotalVar = spendingVar + ohEffVar + volumeVar;

        VarianceAnalysisResponse.OverheadVarianceDto ohDto = VarianceAnalysisResponse.OverheadVarianceDto.builder()
                .actualOverhead(actualOH).budgetedOverhead(budgetAllowance)
                .spendingVariance(spendingVar).spendingVerdict(spendingVar > 0 ? "U" : "F")
                .efficiencyVariance(ohEffVar).efficiencyVerdict(ohEffVar > 0 ? "U" : "F")
                .volumeVariance(volumeVar).volumeVerdict(volumeVar > 0 ? "U" : "F")
                .totalVariance(ohTotalVar).totalVerdict(ohTotalVar > 0 ? "U" : "F")
                .build();

        // ── VAR-BUDGET: 예산 소진율 ──
        Map<Long, Long> actualCostByProject = computeActualCostByProject(allEntries, allExpenses);
        List<VarianceAnalysisResponse.BudgetConsumptionDto> budgetDtos = new ArrayList<>();
        for (BudgetPlan bp : budgets) {
            Project p = bp.getProject();
            long actual = actualCostByProject.getOrDefault(p.getId(), 0L);
            double rate = bp.getBudgetAmount() > 0 ? Math.round((double) actual / bp.getBudgetAmount() * 10000) / 100.0 : 0;
            String status = rate <= 80 ? "정상" : rate <= 100 ? "주의" : "초과";

            budgetDtos.add(VarianceAnalysisResponse.BudgetConsumptionDto.builder()
                    .projectName(p.getName())
                    .departmentName(p.getDepartment().getName())
                    .budgetAmount(bp.getBudgetAmount())
                    .actualSpent(actual)
                    .consumptionRate(rate)
                    .status(status)
                    .build());
        }

        // ── VAR-SUMMARY: 프로젝트별 종합 ──
        List<VarianceAnalysisResponse.VarianceSummaryDto> summaryDtos = new ArrayList<>();
        for (VarianceAnalysisResponse.LaborVarianceDto lv : laborDtos) {
            summaryDtos.add(VarianceAnalysisResponse.VarianceSummaryDto.builder()
                    .projectName(lv.getProjectName())
                    .departmentName(lv.getDepartmentName())
                    .totalVariance(lv.getTotalVariance())
                    .verdict(lv.getTotalVerdict())
                    .rateVariance(lv.getRateVariance())
                    .efficiencyVariance(lv.getEfficiencyVariance())
                    .overheadVariance(0L)
                    .build());
        }

        return VarianceAnalysisResponse.builder()
                .laborVariances(laborDtos)
                .overheadVariance(ohDto)
                .budgetConsumptions(budgetDtos)
                .summaries(summaryDtos)
                .build();
    }

    // ══════════════════════════════════════════════════════════
    // 공통 헬퍼 메서드
    // ══════════════════════════════════════════════════════════

    /** Cost Driver별 수익본부 비율 계산 (M2, M3 공용) */
    private Map<Long, Double> computeDriverRatios(CostDriver driver, List<Department> revenueDepts) {
        Map<Long, Double> values = new LinkedHashMap<>();
        double total = 0;
        switch (driver) {
            case HEADCOUNT -> {
                List<Employee> all = employeeRepository.findAll();
                for (Department d : revenueDepts) {
                    double v = all.stream().filter(e -> e.getDepartment().getId().equals(d.getId())).count();
                    values.put(d.getId(), v); total += v;
                }
            }
            case REVENUE -> {
                List<Project> all = projectRepository.findAll();
                for (Department d : revenueDepts) {
                    double v = all.stream().filter(p -> p.getDepartment().getId().equals(d.getId())).mapToLong(Project::getContractAmount).sum();
                    values.put(d.getId(), v); total += v;
                }
            }
            case LABOR_HOURS -> {
                List<TimeEntry> all = timeEntryRepository.findAll();
                for (Department d : revenueDepts) {
                    double v = all.stream().filter(t -> t.getProject().getDepartment().getId().equals(d.getId())).mapToDouble(t -> t.getHours().doubleValue()).sum();
                    values.put(d.getId(), v); total += v;
                }
            }
        }
        Map<Long, Double> ratios = new LinkedHashMap<>();
        for (var e : values.entrySet()) ratios.put(e.getKey(), total > 0 ? e.getValue() / total : 0);
        return ratios;
    }

    /** 프로젝트별 실제원가 계산 (M3, M4 공용) */
    private Map<Long, Long> computeActualCostByProject(List<TimeEntry> entries, List<DirectExpense> expenses) {
        Map<Long, Long> result = new HashMap<>();
        entries.stream().collect(Collectors.groupingBy(t -> t.getProject().getId())).forEach((pid, tList) -> {
            long labor = tList.stream().mapToLong(t -> (long)(t.getEmployee().getHourlyRate() * t.getHours().doubleValue())).sum();
            result.merge(pid, labor, Long::sum);
        });
        expenses.stream().collect(Collectors.groupingBy(e -> e.getProject().getId())).forEach((pid, eList) -> {
            long direct = eList.stream().mapToLong(DirectExpense::getAmount).sum();
            result.merge(pid, direct, Long::sum);
        });
        return result;
    }
}

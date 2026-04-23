package com.costpilot.analysis.service;

import com.costpilot.analysis.adapter.web.dto.CostAggregationResponse;
import com.costpilot.analysis.adapter.web.dto.TransferPricingResponse;
import com.costpilot.analysis.domain.CostDriver;
import com.costpilot.analysis.domain.PricingMethod;
import com.costpilot.analysis.port.in.AnalysisUseCase;
import com.costpilot.expense.adapter.persistence.JpaDirectExpenseRepository;
import com.costpilot.expense.adapter.persistence.JpaOverheadExpenseRepository;
import com.costpilot.expense.domain.DirectExpense;
import com.costpilot.expense.domain.OverheadExpense;
import com.costpilot.organization.adapter.persistence.JpaDepartmentRepository;
import com.costpilot.organization.domain.Department;
import com.costpilot.organization.domain.DepartmentType;
import com.costpilot.organization.domain.Employee;
import com.costpilot.organization.domain.Project;
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
}

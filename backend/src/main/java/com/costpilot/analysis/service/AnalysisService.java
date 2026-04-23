package com.costpilot.analysis.service;

import com.costpilot.analysis.adapter.web.dto.CostAggregationResponse;
import com.costpilot.analysis.adapter.web.dto.TransferPricingResponse;
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
    public List<TransferPricingResponse> calculateTransferPricing(PricingMethod method) {
        List<OverheadExpense> allOverhead = overheadExpenseRepository.findAll();
        Map<Department, Long> overheadBySupportDept = allOverhead.stream()
                .collect(Collectors.groupingBy(OverheadExpense::getDepartment, Collectors.summingLong(OverheadExpense::getAmount)));

        // 수익본부 목록을 DB에서 찾아서 등분 배부하는 시뮬레이션
        List<Department> revenueDepts = departmentRepository.findAll().stream()
                .filter(d -> d.getType() == DepartmentType.수익)
                .collect(Collectors.toList());
                
        int revenueCount = revenueDepts.size();
        if(revenueCount == 0) return new ArrayList<>();

        double multiplier = method.getMultiplier();
        List<TransferPricingResponse> responses = new ArrayList<>();

        for(Map.Entry<Department, Long> entry : overheadBySupportDept.entrySet()) {
            Department supportDept = entry.getKey();
            long baseCost = entry.getValue();
            long allocatedTotal = (long)(baseCost * multiplier);
            long perRevenue = allocatedTotal / revenueCount;

            List<TransferPricingResponse.AllocationDto> allocations = new ArrayList<>();
            for(Department revDept : revenueDepts) {
                allocations.add(TransferPricingResponse.AllocationDto.builder()
                        .revenueDepartmentName(revDept.getName())
                        .allocatedAmount(perRevenue)
                        .build());
            }
            
            responses.add(TransferPricingResponse.builder()
                    .supportDepartmentName(supportDept.getName())
                    .totalOverheadCost(baseCost)
                    .pricingMethod(method.name())
                    .allocations(allocations)
                    .build());
        }
        return responses;
    }
}

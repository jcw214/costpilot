package com.costpilot.organization.service;

import com.costpilot.organization.adapter.web.dto.*;
import com.costpilot.organization.domain.*;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import com.costpilot.organization.port.out.*;
import com.costpilot.global.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrganizationQueryService implements OrganizationQueryUseCase {

    private final DepartmentRepository departmentRepository;
    private final EmployeeRepository employeeRepository;
    private final ProjectRepository projectRepository;
    private final ProjectTypeRepository projectTypeRepository;
    private final JobGradeRepository jobGradeRepository;

    @Override
    public List<DepartmentResponse> getDepartments(String type) {
        List<Department> departments;
        if (type != null && !type.isBlank()) {
            DepartmentType departmentType = DepartmentType.valueOf(type);
            departments = departmentRepository.findByType(departmentType);
        } else {
            departments = departmentRepository.findAll();
        }
        return departments.stream()
                .map(d -> new DepartmentResponse(
                        d.getId(),
                        d.getName(),
                        d.getType().name(),
                        d.getEmployees().size()
                ))
                .toList();
    }

    @Override
    public List<EmployeeResponse> getEmployees(Long departmentId, Long jobGradeId) {
        List<Employee> employees;
        if (departmentId != null && jobGradeId != null) {
            employees = employeeRepository.findByDepartmentIdAndJobGradeId(departmentId, jobGradeId);
        } else if (departmentId != null) {
            employees = employeeRepository.findByDepartmentId(departmentId);
        } else if (jobGradeId != null) {
            employees = employeeRepository.findByJobGradeId(jobGradeId);
        } else {
            employees = employeeRepository.findAll();
        }
        return employees.stream()
                .map(e -> new EmployeeResponse(
                        e.getId(),
                        e.getName(),
                        e.getDepartment().getName(),
                        e.getJobGrade().getCode(),
                        e.getJobGrade().getName(),
                        e.getHourlyRate(),
                        e.getJobGrade().getStandardHourlyRate()
                ))
                .toList();
    }

    @Override
    public List<ProjectResponse> getProjects(Long departmentId, String status) {
        List<Project> projects;
        if (departmentId != null && status != null && !status.isBlank()) {
            ProjectStatus projectStatus = ProjectStatus.valueOf(status);
            projects = projectRepository.findByDepartmentIdAndStatus(departmentId, projectStatus);
        } else if (departmentId != null) {
            projects = projectRepository.findByDepartmentId(departmentId);
        } else if (status != null && !status.isBlank()) {
            ProjectStatus projectStatus = ProjectStatus.valueOf(status);
            projects = projectRepository.findByStatus(projectStatus);
        } else {
            projects = projectRepository.findAll();
        }
        return projects.stream()
                .map(p -> new ProjectResponse(
                        p.getId(),
                        p.getName(),
                        p.getDepartment().getName(),
                        p.getProjectType().getName(),
                        p.getStatus().name(),
                        p.getContractAmount(),
                        p.getStartDate(),
                        p.getEndDate()
                ))
                .toList();
    }

    @Override
    public List<ProjectTypeResponse> getProjectTypes() {
        return projectTypeRepository.findAll().stream()
                .map(pt -> new ProjectTypeResponse(pt.getId(), pt.getName()))
                .toList();
    }

    @Override
    public List<JobGradeResponse> getJobGrades() {
        return jobGradeRepository.findAll().stream()
                .map(jg -> new JobGradeResponse(
                        jg.getId(), jg.getCode(), jg.getName(), jg.getStandardHourlyRate()
                ))
                .toList();
    }

    @Override
    @Transactional
    public JobGradeResponse updateJobGradeStandardRate(Long id, Integer standardHourlyRate) {
        JobGrade jobGrade = jobGradeRepository.findById(id)
                .orElseThrow(() -> new BusinessException(
                        "직급을 찾을 수 없습니다: id=" + id, HttpStatus.NOT_FOUND));
        jobGrade.updateStandardHourlyRate(standardHourlyRate);
        return new JobGradeResponse(
                jobGrade.getId(), jobGrade.getCode(),
                jobGrade.getName(), jobGrade.getStandardHourlyRate()
        );
    }
}

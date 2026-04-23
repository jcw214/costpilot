package com.costpilot.organization.port.in;

import com.costpilot.organization.adapter.web.dto.*;

import java.util.List;

public interface OrganizationQueryUseCase {

    List<DepartmentResponse> getDepartments(String type);

    List<EmployeeResponse> getEmployees(Long departmentId, Long jobGradeId);

    List<ProjectResponse> getProjects(Long departmentId, String status);

    List<ProjectTypeResponse> getProjectTypes();

    List<JobGradeResponse> getJobGrades();

    JobGradeResponse updateJobGradeStandardRate(Long id, Integer standardHourlyRate);
}

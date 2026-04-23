package com.costpilot.organization.port.out;

import com.costpilot.organization.domain.Project;
import com.costpilot.organization.domain.ProjectStatus;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository {

    List<Project> findAll();

    List<Project> findByDepartmentId(Long departmentId);

    List<Project> findByStatus(ProjectStatus status);

    List<Project> findByDepartmentIdAndStatus(Long departmentId, ProjectStatus status);

    Optional<Project> findById(Long id);

    Project save(Project project);

    <S extends Project> List<S> saveAll(Iterable<S> projects);
}

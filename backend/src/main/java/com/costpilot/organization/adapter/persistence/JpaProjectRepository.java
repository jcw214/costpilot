package com.costpilot.organization.adapter.persistence;

import com.costpilot.organization.domain.Project;
import com.costpilot.organization.domain.ProjectStatus;
import com.costpilot.organization.port.out.ProjectRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JpaProjectRepository extends JpaRepository<Project, Long>, ProjectRepository {

    @Override
    @Query("SELECT p FROM Project p JOIN FETCH p.department JOIN FETCH p.projectType")
    List<Project> findAll();

    @Override
    @Query("SELECT p FROM Project p JOIN FETCH p.department JOIN FETCH p.projectType WHERE p.department.id = :departmentId")
    List<Project> findByDepartmentId(Long departmentId);

    @Override
    @Query("SELECT p FROM Project p JOIN FETCH p.department JOIN FETCH p.projectType WHERE p.status = :status")
    List<Project> findByStatus(ProjectStatus status);

    @Override
    @Query("SELECT p FROM Project p JOIN FETCH p.department JOIN FETCH p.projectType WHERE p.department.id = :departmentId AND p.status = :status")
    List<Project> findByDepartmentIdAndStatus(Long departmentId, ProjectStatus status);
}

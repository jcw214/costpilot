package com.costpilot.organization.port.out;

import com.costpilot.organization.domain.Department;
import com.costpilot.organization.domain.DepartmentType;

import java.util.List;
import java.util.Optional;

public interface DepartmentRepository {

    List<Department> findAll();

    List<Department> findByType(DepartmentType type);

    Optional<Department> findById(Long id);

    Department save(Department department);

    long count();
}

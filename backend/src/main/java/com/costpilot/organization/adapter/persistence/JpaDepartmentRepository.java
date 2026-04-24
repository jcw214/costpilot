package com.costpilot.organization.adapter.persistence;

import com.costpilot.organization.domain.Department;
import com.costpilot.organization.domain.DepartmentType;
import com.costpilot.organization.port.out.DepartmentRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JpaDepartmentRepository extends JpaRepository<Department, Long>, DepartmentRepository {

    @Override
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees")
    List<Department> findAll();

    @Override
    @Query("SELECT d FROM Department d LEFT JOIN FETCH d.employees WHERE d.type = :type")
    List<Department> findByType(DepartmentType type);
}

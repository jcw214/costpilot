package com.costpilot.organization.adapter.persistence;

import com.costpilot.organization.domain.Employee;
import com.costpilot.organization.port.out.EmployeeRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface JpaEmployeeRepository extends JpaRepository<Employee, Long>, EmployeeRepository {

    @Override
    @Query("SELECT e FROM Employee e JOIN FETCH e.department JOIN FETCH e.jobGrade")
    List<Employee> findAll();

    @Override
    @Query("SELECT e FROM Employee e JOIN FETCH e.department JOIN FETCH e.jobGrade WHERE e.department.id = :departmentId")
    List<Employee> findByDepartmentId(Long departmentId);

    @Override
    @Query("SELECT e FROM Employee e JOIN FETCH e.department JOIN FETCH e.jobGrade WHERE e.jobGrade.id = :jobGradeId")
    List<Employee> findByJobGradeId(Long jobGradeId);

    @Override
    @Query("SELECT e FROM Employee e JOIN FETCH e.department JOIN FETCH e.jobGrade WHERE e.department.id = :departmentId AND e.jobGrade.id = :jobGradeId")
    List<Employee> findByDepartmentIdAndJobGradeId(Long departmentId, Long jobGradeId);
}

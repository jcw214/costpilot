package com.costpilot.organization.port.out;

import com.costpilot.organization.domain.Employee;

import java.util.List;
import java.util.Optional;

public interface EmployeeRepository {

    List<Employee> findAll();

    List<Employee> findByDepartmentId(Long departmentId);

    List<Employee> findByJobGradeId(Long jobGradeId);

    List<Employee> findByDepartmentIdAndJobGradeId(Long departmentId, Long jobGradeId);

    Optional<Employee> findById(Long id);

    Employee save(Employee employee);

    <S extends Employee> List<S> saveAll(Iterable<S> employees);
}

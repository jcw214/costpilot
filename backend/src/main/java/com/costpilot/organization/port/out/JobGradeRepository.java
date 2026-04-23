package com.costpilot.organization.port.out;

import com.costpilot.organization.domain.JobGrade;

import java.util.List;
import java.util.Optional;

public interface JobGradeRepository {

    List<JobGrade> findAll();

    Optional<JobGrade> findById(Long id);

    Optional<JobGrade> findByCode(String code);

    JobGrade save(JobGrade jobGrade);

    <S extends JobGrade> List<S> saveAll(Iterable<S> jobGrades);
}

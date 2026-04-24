package com.costpilot.organization.adapter.persistence;

import com.costpilot.organization.domain.JobGrade;
import com.costpilot.organization.port.out.JobGradeRepository;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JpaJobGradeRepository extends JpaRepository<JobGrade, Long>, JobGradeRepository {

    Optional<JobGrade> findByCode(String code);
}

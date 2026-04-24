package com.costpilot.budget.adapter.persistence;

import com.costpilot.budget.domain.StandardCostRate;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.jpa.repository.EntityGraph;
import java.util.List;

public interface JpaStandardCostRateRepository extends JpaRepository<StandardCostRate, Long> {
    @Override
    @EntityGraph(attributePaths = {"projectType", "jobGrade"})
    List<StandardCostRate> findAll();
}

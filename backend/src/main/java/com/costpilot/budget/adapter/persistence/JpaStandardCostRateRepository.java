package com.costpilot.budget.adapter.persistence;

import com.costpilot.budget.domain.StandardCostRate;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaStandardCostRateRepository extends JpaRepository<StandardCostRate, Long> {
}

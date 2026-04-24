package com.costpilot.settings.adapter.persistence;

import com.costpilot.settings.domain.CostDriverEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JpaCostDriverRepository extends JpaRepository<CostDriverEntity, Long> {
    Optional<CostDriverEntity> findByCode(String code);
    boolean existsByCode(String code);
}

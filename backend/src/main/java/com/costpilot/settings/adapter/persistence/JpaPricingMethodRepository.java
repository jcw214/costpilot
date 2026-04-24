package com.costpilot.settings.adapter.persistence;

import com.costpilot.settings.domain.PricingMethodEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JpaPricingMethodRepository extends JpaRepository<PricingMethodEntity, Long> {
    Optional<PricingMethodEntity> findByCode(String code);
    boolean existsByCode(String code);
}

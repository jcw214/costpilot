package com.costpilot.budget.adapter.web;

import com.costpilot.budget.adapter.persistence.JpaStandardCostRateRepository;
import com.costpilot.budget.adapter.web.dto.StandardCostRateResponse;
import com.costpilot.budget.domain.StandardCostRate;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/standard-cost-rates")
@RequiredArgsConstructor
public class StandardCostRateController {

    private final JpaStandardCostRateRepository repository;

    @GetMapping
    public ResponseEntity<List<StandardCostRateResponse>> getAllRates() {
        List<StandardCostRateResponse> result = repository.findAll().stream()
                .map(r -> StandardCostRateResponse.builder()
                        .id(r.getId())
                        .projectTypeName(r.getProjectType().getName())
                        .jobGradeName(r.getJobGrade().getName())
                        .standardHourlyRate(r.getJobGrade().getStandardHourlyRate())
                        .standardHours(r.getStandardHours().doubleValue())
                        .standardCost((long)(r.getJobGrade().getStandardHourlyRate() * r.getStandardHours().doubleValue()))
                        .build())
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }
}

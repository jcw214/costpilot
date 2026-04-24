package com.costpilot.settings.adapter.web;

import com.costpilot.settings.adapter.persistence.JpaPricingMethodRepository;
import com.costpilot.settings.adapter.web.dto.PricingMethodRequest;
import com.costpilot.settings.adapter.web.dto.PricingMethodResponse;
import com.costpilot.settings.domain.PricingMethodEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/settings/pricing-methods")
@RequiredArgsConstructor
public class PricingMethodController {

    private final JpaPricingMethodRepository repository;

    @GetMapping
    public ResponseEntity<List<PricingMethodResponse>> getAll() {
        List<PricingMethodResponse> result = repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PricingMethodResponse> update(@PathVariable Long id, @RequestBody PricingMethodRequest request) {
        PricingMethodEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("가격 정책을 찾을 수 없습니다: " + id));
        entity.update(request.getDisplayName(), request.getMultiplier(), request.getEnabled());
        repository.save(entity);
        return ResponseEntity.ok(toResponse(entity));
    }

    private PricingMethodResponse toResponse(PricingMethodEntity e) {
        return PricingMethodResponse.builder()
                .id(e.getId())
                .code(e.getCode())
                .displayName(e.getDisplayName())
                .multiplier(e.getMultiplier())
                .enabled(e.getEnabled())
                .build();
    }
}

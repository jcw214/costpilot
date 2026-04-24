package com.costpilot.settings.adapter.web;

import com.costpilot.settings.adapter.persistence.JpaCostDriverRepository;
import com.costpilot.settings.adapter.web.dto.CostDriverRequest;
import com.costpilot.settings.adapter.web.dto.CostDriverResponse;
import com.costpilot.settings.domain.CostDriverEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/settings/cost-drivers")
@RequiredArgsConstructor
public class CostDriverController {

    private final JpaCostDriverRepository repository;

    @GetMapping
    public ResponseEntity<List<CostDriverResponse>> getAll() {
        List<CostDriverResponse> result = repository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}")
    public ResponseEntity<CostDriverResponse> update(@PathVariable Long id, @RequestBody CostDriverRequest request) {
        CostDriverEntity entity = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("배부 기준을 찾을 수 없습니다: " + id));
        entity.update(request.getDisplayName(), request.getDescription(), request.getEnabled());
        repository.save(entity);
        return ResponseEntity.ok(toResponse(entity));
    }

    private CostDriverResponse toResponse(CostDriverEntity e) {
        return CostDriverResponse.builder()
                .id(e.getId())
                .code(e.getCode())
                .displayName(e.getDisplayName())
                .description(e.getDescription())
                .enabled(e.getEnabled())
                .build();
    }
}

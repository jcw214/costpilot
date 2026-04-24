package com.costpilot.dashboard.adapter.web;

import com.costpilot.dashboard.adapter.web.dto.DashboardSummaryResponse;
import com.costpilot.dashboard.adapter.web.dto.PerformanceResponse;
import com.costpilot.dashboard.port.in.DashboardUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardUseCase dashboardUseCase;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardUseCase.getDashboardSummary());
    }

    @GetMapping("/performance")
    public ResponseEntity<PerformanceResponse> getPerformance() {
        return ResponseEntity.ok(dashboardUseCase.getPerformanceAnalysis());
    }
}

package com.costpilot.analysis.adapter.web;

import com.costpilot.analysis.adapter.web.dto.CostAggregationResponse;
import com.costpilot.analysis.adapter.web.dto.TransferPricingResponse;
import com.costpilot.analysis.domain.PricingMethod;
import com.costpilot.analysis.port.in.AnalysisUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
public class AnalysisController {

    private final AnalysisUseCase analysisUseCase;

    @GetMapping("/cost")
    public ResponseEntity<CostAggregationResponse> getCostAggregation() {
        return ResponseEntity.ok(analysisUseCase.aggregateCosts());
    }

    @GetMapping("/transfer")
    public ResponseEntity<List<TransferPricingResponse>> getTransferPricing(
            @RequestParam(defaultValue = "COST") PricingMethod method) {
        return ResponseEntity.ok(analysisUseCase.calculateTransferPricing(method));
    }
}

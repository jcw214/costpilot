package com.costpilot.analysis.port.in;

import com.costpilot.analysis.adapter.web.dto.CostAggregationResponse;
import com.costpilot.analysis.adapter.web.dto.StandardCostResponse;
import com.costpilot.analysis.adapter.web.dto.TransferPricingResponse;
import com.costpilot.analysis.adapter.web.dto.VarianceAnalysisResponse;
import com.costpilot.analysis.domain.CostDriver;
import com.costpilot.analysis.domain.PricingMethod;

import java.util.List;

public interface AnalysisUseCase {
    CostAggregationResponse aggregateCosts();
    List<TransferPricingResponse> calculateTransferPricing(PricingMethod method, CostDriver driver);
    StandardCostResponse getStandardCostAnalysis(CostDriver driver);
    VarianceAnalysisResponse getVarianceAnalysis();
}

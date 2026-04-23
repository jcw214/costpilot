package com.costpilot.analysis.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class VarianceAnalysisResponse {

    // ── VAR-LABOR: 직접노무비 차이 분석 ──
    private List<LaborVarianceDto> laborVariances;

    // ── VAR-OVERHEAD: 간접원가 차이 분석 ──
    private OverheadVarianceDto overheadVariance;

    // ── VAR-BUDGET: 예산 소진율 ──
    private List<BudgetConsumptionDto> budgetConsumptions;

    // ── VAR-SUMMARY: 프로젝트별 종합 차이 ──
    private List<VarianceSummaryDto> summaries;

    /**
     * 직접노무비 차이 분석 (프로젝트별)
     * 임률차이 = (실제임률 - 표준임률) × 실제시간
     * 능률차이 = (실제시간 - 표준허용시간) × 표준임률
     */
    @Getter
    @Builder
    public static class LaborVarianceDto {
        private String projectName;
        private String departmentName;
        private Long standardLaborCost;      // 표준노무비
        private Long actualLaborCost;        // 실제노무비
        private Long rateVariance;           // 임률차이
        private String rateVerdict;          // F / U
        private Long efficiencyVariance;     // 능률차이
        private String efficiencyVerdict;    // F / U
        private Long totalVariance;          // 총차이
        private String totalVerdict;         // F / U
    }

    /**
     * 간접원가 차이 분석 (전사 단위 3분법)
     * 예산차이 = 실제간접원가 - 변동예산허용액
     * 능률차이 = (실제시간 - 표준허용시간) × 변동간접비 배부율
     * 조업도차이 = (실제시간 - 정상조업도) × 고정간접비 배부율
     */
    @Getter
    @Builder
    public static class OverheadVarianceDto {
        private Long actualOverhead;
        private Long budgetedOverhead;
        private Long spendingVariance;        // 예산차이
        private String spendingVerdict;
        private Long efficiencyVariance;      // 능률차이
        private String efficiencyVerdict;
        private Long volumeVariance;          // 조업도차이
        private String volumeVerdict;
        private Long totalVariance;
        private String totalVerdict;
    }

    /**
     * 예산 소진율 (프로젝트별)
     */
    @Getter
    @Builder
    public static class BudgetConsumptionDto {
        private String projectName;
        private String departmentName;
        private Long budgetAmount;
        private Long actualSpent;
        private Double consumptionRate;  // 소진율 (%)
        private String status;           // 정상 / 주의 / 초과
    }

    /**
     * 프로젝트별 종합 차이 요약
     */
    @Getter
    @Builder
    public static class VarianceSummaryDto {
        private String projectName;
        private String departmentName;
        private Long totalVariance;
        private String verdict;
        private Long rateVariance;       // 임률 요인
        private Long efficiencyVariance; // 능률 요인
        private Long overheadVariance;   // 간접원가 요인
    }
}

package com.costpilot.analysis.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class StandardCostResponse {

    // ── STD-BASE: 표준원가 기준 테이블 ──
    private List<StandardRateDto> standardRates;

    // ── STD-ALLOC: 표준원가 배분 결과 ──
    private List<ProjectAllocationDto> projectAllocations;

    // ── STD-COMPARE: 표준 vs. 실제 비교 ──
    private List<ProjectComparisonDto> comparisons;

    @Getter
    @Builder
    public static class StandardRateDto {
        private String projectTypeName;
        private String jobGradeName;
        private Integer standardHourlyRate;
        private Double standardHours;
        private Long standardCost;  // 표준시급 × 표준공수
    }

    @Getter
    @Builder
    public static class ProjectAllocationDto {
        private String projectName;
        private String departmentName;
        private Long standardCost;       // 표준원가 합계
        private Long allocatedOverhead;  // 배분된 간접원가
        private Long totalStandardCost;  // 표준원가 + 간접원가
    }

    @Getter
    @Builder
    public static class ProjectComparisonDto {
        private String projectName;
        private String departmentName;
        private Long standardCost;   // 표준원가
        private Long actualCost;     // 실제원가
        private Long variance;       // 차이 (실제 - 표준)
        private Double varianceRate; // 차이율 (%)
        private String verdict;      // F (유리) / U (불리)
    }
}

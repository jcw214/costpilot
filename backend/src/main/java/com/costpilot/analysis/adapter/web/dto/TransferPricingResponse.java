package com.costpilot.analysis.adapter.web.dto;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class TransferPricingResponse {
    private String supportDepartmentName;
    private Long totalOverheadCost;
    private String pricingMethod;
    private String costDriver;
    private List<AllocationDto> allocations;

    @Getter
    @Builder
    public static class AllocationDto {
        private String revenueDepartmentName;
        private Double driverRatio;
        private Long allocatedAmount;
    }
}

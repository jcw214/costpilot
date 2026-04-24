package com.costpilot.settings.adapter.web.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PricingMethodResponse {
    private Long id;
    private String code;
    private String displayName;
    private Double multiplier;
    private Boolean enabled;
}

package com.costpilot.analysis.domain;

public enum PricingMethod {
    COST(1.0),
    MARKET(1.2),
    NEGOTIATED(0.9);

    private final double multiplier;

    PricingMethod(double multiplier) {
        this.multiplier = multiplier;
    }

    public double getMultiplier() {
        return multiplier;
    }
}

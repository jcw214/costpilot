package com.costpilot.settings.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "pricing_methods")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class PricingMethodEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(nullable = false)
    private Double multiplier;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Builder
    public PricingMethodEntity(String code, String displayName, Double multiplier, Boolean enabled) {
        this.code = code;
        this.displayName = displayName;
        this.multiplier = multiplier;
        this.enabled = enabled != null ? enabled : true;
    }

    public void update(String displayName, Double multiplier, Boolean enabled) {
        if (displayName != null) this.displayName = displayName;
        if (multiplier != null) this.multiplier = multiplier;
        if (enabled != null) this.enabled = enabled;
    }
}

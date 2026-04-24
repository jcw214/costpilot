package com.costpilot.settings.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cost_drivers")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class CostDriverEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(nullable = false, length = 100)
    private String displayName;

    @Column(length = 200)
    private String description;

    @Column(nullable = false)
    private Boolean enabled = true;

    @Builder
    public CostDriverEntity(String code, String displayName, String description, Boolean enabled) {
        this.code = code;
        this.displayName = displayName;
        this.description = description;
        this.enabled = enabled != null ? enabled : true;
    }

    public void update(String displayName, String description, Boolean enabled) {
        if (displayName != null) this.displayName = displayName;
        if (description != null) this.description = description;
        if (enabled != null) this.enabled = enabled;
    }
}

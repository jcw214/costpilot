package com.costpilot.organization.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "project_types")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class ProjectType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Builder
    public ProjectType(String name) {
        this.name = name;
    }
}

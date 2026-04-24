package com.costpilot.organization.domain;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "departments")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DepartmentType type;

    @OneToMany(mappedBy = "department")
    private List<Employee> employees = new ArrayList<>();

    @OneToMany(mappedBy = "department")
    private List<Project> projects = new ArrayList<>();

    @Builder
    public Department(String name, DepartmentType type) {
        this.name = name;
        this.type = type;
    }
}

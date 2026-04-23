package com.costpilot.organization.port.out;

import com.costpilot.organization.domain.ProjectType;

import java.util.List;
import java.util.Optional;

public interface ProjectTypeRepository {

    List<ProjectType> findAll();

    Optional<ProjectType> findById(Long id);

    ProjectType save(ProjectType projectType);

    <S extends ProjectType> List<S> saveAll(Iterable<S> projectTypes);
}

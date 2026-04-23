package com.costpilot.organization.adapter.persistence;

import com.costpilot.organization.domain.ProjectType;
import com.costpilot.organization.port.out.ProjectTypeRepository;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaProjectTypeRepository extends JpaRepository<ProjectType, Long>, ProjectTypeRepository {
}

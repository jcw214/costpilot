package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.ProjectTypeResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/project-types")
@RequiredArgsConstructor
public class ProjectTypeController {

    private final OrganizationQueryUseCase organizationQueryUseCase;

    @GetMapping
    public List<ProjectTypeResponse> getProjectTypes() {
        return organizationQueryUseCase.getProjectTypes();
    }
}

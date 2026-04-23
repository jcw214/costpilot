package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.ProjectResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final OrganizationQueryUseCase organizationQueryUseCase;

    @GetMapping
    public List<ProjectResponse> getProjects(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String status) {
        return organizationQueryUseCase.getProjects(departmentId, status);
    }
}

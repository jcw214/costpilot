package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.ProjectResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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

    @PatchMapping("/{id}")
    public ProjectResponse updateContractAmount(
            @PathVariable Long id,
            @RequestBody Map<String, Long> request) {
        Long contractAmount = request.get("contractAmount");
        return organizationQueryUseCase.updateProjectContractAmount(id, contractAmount);
    }
}

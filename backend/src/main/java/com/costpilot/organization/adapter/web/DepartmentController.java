package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.DepartmentResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/departments")
@RequiredArgsConstructor
public class DepartmentController {

    private final OrganizationQueryUseCase organizationQueryUseCase;

    @GetMapping
    public List<DepartmentResponse> getDepartments(
            @RequestParam(required = false) String type) {
        return organizationQueryUseCase.getDepartments(type);
    }
}

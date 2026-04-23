package com.costpilot.organization.adapter.web;

import com.costpilot.organization.adapter.web.dto.JobGradeResponse;
import com.costpilot.organization.port.in.OrganizationQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/job-grades")
@RequiredArgsConstructor
public class JobGradeController {

    private final OrganizationQueryUseCase organizationQueryUseCase;

    @GetMapping
    public List<JobGradeResponse> getJobGrades() {
        return organizationQueryUseCase.getJobGrades();
    }

    @PatchMapping("/{id}")
    public JobGradeResponse updateStandardHourlyRate(
            @PathVariable Long id,
            @RequestBody Map<String, Integer> request) {
        Integer standardHourlyRate = request.get("standardHourlyRate");
        return organizationQueryUseCase.updateJobGradeStandardRate(id, standardHourlyRate);
    }
}

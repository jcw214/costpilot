package com.costpilot.timesheet.adapter.web.dto;

import com.costpilot.timesheet.domain.TimeEntry;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
public class TimeEntryResponse {
    private final Long id;
    private final Long employeeId;
    private final String employeeName;
    private final Long projectId;
    private final String projectName;
    private final String activityType;
    private final LocalDate workDate;
    private final BigDecimal hours;

    public TimeEntryResponse(TimeEntry entry) {
        this.id = entry.getId();
        this.employeeId = entry.getEmployee().getId();
        this.employeeName = entry.getEmployee().getName();
        this.projectId = entry.getProject().getId();
        this.projectName = entry.getProject().getName();
        this.activityType = entry.getActivityType();
        this.workDate = entry.getWorkDate();
        this.hours = entry.getHours();
    }
}

package com.costpilot.timesheet.adapter.web;

import com.costpilot.timesheet.adapter.web.dto.TimeEntryResponse;
import com.costpilot.timesheet.port.in.TimesheetQueryUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/timesheets")
@RequiredArgsConstructor
public class TimesheetController {

    private final TimesheetQueryUseCase timesheetQueryUseCase;

    @GetMapping
    public ResponseEntity<List<TimeEntryResponse>> getAllTimeEntries() {
        return ResponseEntity.ok(timesheetQueryUseCase.getAllTimeEntries());
    }
}

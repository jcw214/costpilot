package com.costpilot.timesheet.port.in;

import com.costpilot.timesheet.adapter.web.dto.TimeEntryResponse;
import java.util.List;

public interface TimesheetQueryUseCase {
    List<TimeEntryResponse> getAllTimeEntries();
}

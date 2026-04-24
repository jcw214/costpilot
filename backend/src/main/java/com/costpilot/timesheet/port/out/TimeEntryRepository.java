package com.costpilot.timesheet.port.out;

import com.costpilot.timesheet.domain.TimeEntry;
import java.util.List;

public interface TimeEntryRepository {
    List<TimeEntry> findAll();
    TimeEntry save(TimeEntry timeEntry);
}

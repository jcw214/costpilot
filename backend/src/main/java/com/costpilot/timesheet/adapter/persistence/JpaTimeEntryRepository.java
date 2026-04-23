package com.costpilot.timesheet.adapter.persistence;

import com.costpilot.timesheet.domain.TimeEntry;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JpaTimeEntryRepository extends JpaRepository<TimeEntry, Long> {
}

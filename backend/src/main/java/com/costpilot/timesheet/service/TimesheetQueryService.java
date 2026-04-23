package com.costpilot.timesheet.service;

import com.costpilot.timesheet.adapter.persistence.JpaTimeEntryRepository;
import com.costpilot.timesheet.adapter.web.dto.TimeEntryResponse;
import com.costpilot.timesheet.domain.TimeEntry;
import com.costpilot.timesheet.port.in.TimesheetQueryUseCase;
import com.costpilot.timesheet.port.out.TimeEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TimesheetQueryService implements TimesheetQueryUseCase, TimeEntryRepository {

    private final JpaTimeEntryRepository jpaTimeEntryRepository;

    @Override
    public List<TimeEntry> findAll() {
        return jpaTimeEntryRepository.findAll();
    }

    @Override
    @Transactional
    public TimeEntry save(TimeEntry timeEntry) {
        return jpaTimeEntryRepository.save(timeEntry);
    }

    @Override
    public List<TimeEntryResponse> getAllTimeEntries() {
        return findAll().stream()
                .map(TimeEntryResponse::new)
                .collect(Collectors.toList());
    }
}

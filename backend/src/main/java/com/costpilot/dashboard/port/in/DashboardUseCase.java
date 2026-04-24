package com.costpilot.dashboard.port.in;

import com.costpilot.dashboard.adapter.web.dto.DashboardSummaryResponse;
import com.costpilot.dashboard.adapter.web.dto.PerformanceResponse;

public interface DashboardUseCase {
    DashboardSummaryResponse getDashboardSummary();
    PerformanceResponse getPerformanceAnalysis();
}

package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import java.util.List;

public record DashboardStatsDTO(
        double limitHours,
        double consumedHours,
        double availableHours,
        double usagePercentage,
        List<MonthlyUsageDTO> monthlyHistory
) {
}

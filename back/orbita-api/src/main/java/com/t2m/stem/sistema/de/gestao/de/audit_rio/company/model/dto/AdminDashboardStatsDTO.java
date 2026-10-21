package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import java.util.List;

public record AdminDashboardStatsDTO(
        double totalConsumedHours,
        long activeReservations,
        long totalActiveCompanies,
        long totalAlerts,
        List<AdminAlertDTO> alertsList,
        List<MonthlyCreationDTO> monthlyCreations

) {
}

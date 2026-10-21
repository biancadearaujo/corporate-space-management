package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto;

import java.time.LocalDateTime;

public record CompanyRequestDTO(
        String name,
        String email,
        String cnpj,
        Double monthlyLimitHours,
        Double consumedHours,
        Double maxMonthlyHoursAuditorium,
        Double maxMonthlyHoursMeetingRoom,
        Double maxMonthlyHoursCoworking,
        Double additionalHoursApproved,
        LocalDateTime updatedAt
        ) {
}
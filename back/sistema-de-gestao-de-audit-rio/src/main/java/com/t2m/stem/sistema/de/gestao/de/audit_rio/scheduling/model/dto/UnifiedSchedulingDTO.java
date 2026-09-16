package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UnifiedSchedulingDTO(
        UUID id,
        String name,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String venueName,
        String status,
        String type
) {
}

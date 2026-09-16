package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRejectedRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchedulingRejectedResponseDTO(
        String name,
        String description,
        LocalDateTime startAt,
        LocalDateTime updateAt,
        LocalDateTime endAt,
        LocalDateTime createdAt,
        Company company,
        Venue venue,
        SubVenue subVenue,
//        Set<Equipment> equipments,
        UUID managerId,
        LocalDateTime decidedAt,
        String rejectionReason
) {
    public static SchedulingRejectedResponseDTO from(SchedulingRejectedRequest rejectedRequest) {
        return new SchedulingRejectedResponseDTO(
                rejectedRequest.getName(),
                rejectedRequest.getDescription(),
                rejectedRequest.getStartAt(),
                rejectedRequest.getUpdateAt(),
                rejectedRequest.getEndAt(),
                rejectedRequest.getCreatedAt(),
                rejectedRequest.getCompany(),
                rejectedRequest.getVenue(),
                rejectedRequest.getSubVenue(),
//                rejectedRequest.getEquipments(),
                rejectedRequest.getDecidedBy(),
                rejectedRequest.getDecidedAt(),
                rejectedRequest.getRejectionReason()
        );
    }
}

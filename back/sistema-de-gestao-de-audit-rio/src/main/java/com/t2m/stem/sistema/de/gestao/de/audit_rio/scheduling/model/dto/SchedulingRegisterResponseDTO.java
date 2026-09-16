package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.BookingPeriod;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record SchedulingRegisterResponseDTO(
        UUID schedulingId,
        String name,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        LocalDateTime createdAt,
        UUID createdBy,
        UUID companyId,
        UUID venueId,
//        UUID equipmentsId,
        SchedulingRequestStatus status,
        UUID decidedBy,
        LocalDateTime decidedAt,
        String rejectionReason,
        BookingPeriod bookingPeriod,
        LocalDateTime updateAt
) {
    public static SchedulingRegisterResponseDTO from(SchedulingRegisterRequest schedulingRegisterRequest){
        return new SchedulingRegisterResponseDTO(
                schedulingRegisterRequest.getSchedulingId(),
                schedulingRegisterRequest.getName(),
                schedulingRegisterRequest.getDescription(),
                schedulingRegisterRequest.getStartAt(),
                schedulingRegisterRequest.getEndAt(),
                schedulingRegisterRequest.getCreatedAt(),
                schedulingRegisterRequest.getCreatedBy(),
                schedulingRegisterRequest.getCompany().getCompanyId(),
                schedulingRegisterRequest.getVenue().getVenueId(),
//TODO: Voltar aqui.
//                schedulingRegisterRequest.getgetEquipmentsId(),
                schedulingRegisterRequest.getStatus(),
                schedulingRegisterRequest.getDecidedBy(),
                schedulingRegisterRequest.getDecidedAt(),
                schedulingRegisterRequest.getRejectionReason(),
                schedulingRegisterRequest.getBookingPeriod(),
                schedulingRegisterRequest.getUpdateAt()
        );
    }
}

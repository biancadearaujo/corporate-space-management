package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.factory;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.repository.EquipmentRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@AllArgsConstructor
public class SchedulingFactory {
    private VenueService venueService;
    private EquipmentRepository equipmentRepository;

    public SchedulingRegisterRequest create(SchedulingRegisterRequestDTO requestDTO, User user, Venue venue) {
        SchedulingRegisterRequest schedulingRegisterRequest = new SchedulingRegisterRequest();

        schedulingRegisterRequest.setName(requestDTO.name());
        schedulingRegisterRequest.setDescription(requestDTO.description());
        schedulingRegisterRequest.setCreatedAt(LocalDateTime.now());
        schedulingRegisterRequest.setCreatedBy(user.getUserId());
        schedulingRegisterRequest.setCompany(user.getCompany());
        schedulingRegisterRequest.setVenue(venue);
        schedulingRegisterRequest.setStatus(SchedulingRequestStatus.PENDING);

        if (requestDTO.subVenueId() != null) {
            SubVenue subVenue = venueService.findSubVenueOrThrow(requestDTO.subVenueId(), venue);
            schedulingRegisterRequest.setSubVenue(subVenue);
        }

        if (venue.getVenueType() == VenueType.AUDITORIUM) {
            if (requestDTO.bookingPeriod() == null) {
                throw new IllegalArgumentException
                        ("Choose a shift for your auditorium scheduling (morning, afternoon or full time).");
            }

            LocalDate date = requestDTO.startAt() != null
                    ? requestDTO.startAt().toLocalDate()
                    : LocalDate.now();

            DayOfWeek dayOfWeek = date.getDayOfWeek();

            List<OpeningHours> hours = venue.getOpeningHours().stream()
                    .filter(o -> o.getDayOfWeek() == dayOfWeek)
                    .toList();

            if (hours.isEmpty()) {
                throw new IllegalArgumentException("No opening hours configured for " + dayOfWeek + " at this venue.");
            }

            OpeningHours opening = hours.get(0);

            LocalTime openingTime = opening.getOpeningTime();
            LocalTime closingTime = opening.getClosingTime();

            LocalDateTime startAt;
            LocalDateTime endAt;

            switch (requestDTO.bookingPeriod()) {
                case MORNING -> {
                    startAt = LocalDateTime.of(date, openingTime);
                    endAt = LocalDateTime.of(date, openingTime.plusHours(4));
                }
                case AFTERNOON -> {
                    startAt = LocalDateTime.of(date, closingTime.minusHours(4));
                    endAt = LocalDateTime.of(date, closingTime);
                }
                case FULL_TIME -> {
                    startAt = LocalDateTime.of(date, openingTime);
                    endAt = LocalDateTime.of(date, closingTime);
                }
                default -> throw new IllegalArgumentException("Invalid booking period.");
            }

            schedulingRegisterRequest.setStartAt(startAt);
            schedulingRegisterRequest.setEndAt(endAt);
            schedulingRegisterRequest.setBookingPeriod(requestDTO.bookingPeriod());
        } else {
            schedulingRegisterRequest.setStartAt(requestDTO.startAt());
            schedulingRegisterRequest.setEndAt(requestDTO.endAt());
        }

        if (requestDTO.equipmentIds() != null && !requestDTO.equipmentIds().isEmpty()) {
            List<Equipment> selectedEquipments = equipmentRepository.findAllById(requestDTO.equipmentIds());
            schedulingRegisterRequest.setEquipments(selectedEquipments);
        }

        schedulingRegisterRequest.setStatus(SchedulingRequestStatus.PENDING);
        return schedulingRegisterRequest;
    }
}
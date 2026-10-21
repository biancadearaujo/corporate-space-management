package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.factory;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.repository.EquipmentRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@Service
@AllArgsConstructor
public class ManagerSchedulingFactory {
    private VenueService venueService;
    private UserValidator userValidator;
    private EquipmentRepository equipmentRepository;

    public SchedulingRegisterRequest create(SchedulingRegisterRequestDTO requestDTO, User user, Venue venue) {
        SchedulingRegisterRequest schedulingRegisterRequest = new SchedulingRegisterRequest();

        schedulingRegisterRequest.setName(requestDTO.name());
        schedulingRegisterRequest.setDescription(requestDTO.description());
        schedulingRegisterRequest.setCreatedAt(LocalDateTime.now());
        schedulingRegisterRequest.setCreatedBy(userValidator.getAuthenticatedUser().getUserId());
        schedulingRegisterRequest.setCompany(userValidator.getAuthenticatedUser().getCompany());//TODO: Testar
        schedulingRegisterRequest.setVenue(venue);
        schedulingRegisterRequest.setStatus(SchedulingRequestStatus.APPROVED);

        if (venue.getVenueType() == VenueType.AUDITORIUM) {
            if (requestDTO.bookingPeriod() == null) {
                throw new IllegalArgumentException
                        ("Choose a shift for your auditorium scheduling(morning, afternoon or full time)");
            }
            schedulingRegisterRequest.setBookingPeriod(requestDTO.bookingPeriod());

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
            LocalTime calculatedStartTime = null;
            LocalTime calculatedEndTime = null;

            switch (requestDTO.bookingPeriod()) {
                case MORNING -> {
                    OpeningHours morningBlock = hours.stream()
                            .filter(oh -> oh.getOpeningTime().isBefore(LocalTime.of(12, 0)))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException
                                    ("Morning opening hours not found for this day."));
                    calculatedStartTime = morningBlock.getOpeningTime();
                    calculatedEndTime = morningBlock.getOpeningTime().plusHours(4);
                }
                case AFTERNOON -> {
                    OpeningHours afternoonBlock = hours.stream()
                            .filter(oh -> oh.getOpeningTime().isAfter(LocalTime.of(12, 0)))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException
                                    ("Afternoon opening hours not found for this day."));
                    calculatedStartTime = afternoonBlock.getClosingTime().minusHours(4);
                    calculatedEndTime = afternoonBlock.getClosingTime();
                }
                case FULL_TIME -> {
                    LocalTime fullDayOpening =
                            hours.stream().map(OpeningHours::getOpeningTime).min(LocalTime::compareTo).orElseThrow(
                                    () -> new IllegalArgumentException("Full day opening hours not found."));

                    LocalTime fullDayClosing = hours
                            .stream()
                            .map(OpeningHours::getClosingTime)
                            .max(LocalTime::compareTo)
                            .orElseThrow(() -> new IllegalArgumentException("Full day closing hours not found."));

                    calculatedStartTime = fullDayOpening;
                    calculatedEndTime = fullDayClosing;
                }
                default -> throw new IllegalArgumentException("Invalid booking period.");
            }

            schedulingRegisterRequest.setStartAt(LocalDateTime.of(date, calculatedStartTime));
            schedulingRegisterRequest.setEndAt(LocalDateTime.of(date, calculatedEndTime));

        } else {
            schedulingRegisterRequest.setStartAt(requestDTO.startAt());
            schedulingRegisterRequest.setEndAt(requestDTO.endAt());
        }

        if (requestDTO.subVenueId() != null) {
            SubVenue subVenue = venueService.findSubVenueOrThrow(requestDTO.subVenueId(), venue);
            schedulingRegisterRequest.setSubVenue(subVenue);
        }

//        if (requestDTO.equipmentIds() != null && !requestDTO.equipmentIds().isEmpty()) {
//            List<Equipment> equipments = equipmentRepository.findAllById(requestDTO.equipmentIds());
//            schedulingRegisterRequest.setEquipments(equipments);
//        }

        return schedulingRegisterRequest;
    }

    public Scheduling createSchedulingFromRequest(SchedulingRegisterRequest schedulingRequest) {
        Scheduling scheduling = new Scheduling();

        scheduling.setName(schedulingRequest.getName());
        scheduling.setDescription(schedulingRequest.getDescription());
        scheduling.setStartAt(schedulingRequest.getStartAt());
        scheduling.setEndAt(schedulingRequest.getEndAt());
        scheduling.setCreatedAt(LocalDateTime.now());
        scheduling.setCreatedBy(schedulingRequest.getCreatedBy());
        scheduling.setCompany(schedulingRequest.getCompany());
        scheduling.setVenue(schedulingRequest.getVenue());
        scheduling.setSubVenue(schedulingRequest.getSubVenue());
        scheduling.setBookingPeriod(schedulingRequest.getBookingPeriod());

        return scheduling;
    }
}

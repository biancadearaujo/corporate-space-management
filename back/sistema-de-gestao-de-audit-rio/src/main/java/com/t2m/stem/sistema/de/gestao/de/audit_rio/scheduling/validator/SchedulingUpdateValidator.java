package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.MonthlyUsageCompanyHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.OpeningHoursRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingUpdateValidator {
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private UserValidator userValidator;
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private OpeningHoursRepository openingHoursRepository;
    private MonthlyUsageCompanyHoursRepository monthlyUsageRepository;

    public void validateBeforeApproval(SchedulingRegisterRequest schedulingRegisterRequest){
        if (schedulingRegisterRequest.getStatus() != SchedulingRequestStatus.PENDING){
            throw new IllegalArgumentException("Scheduling request is not pending");
        }
    }

    public void validateStartAt(SchedulingUpdateDTO updateDTO, Venue venue){
        int minAdvanceHours = venue.getMinimumHoursToCancel() != null ? venue.getMinimumHoursToCancel() : 96;
        if (updateDTO.startAt().isBefore(LocalDateTime.now().plusHours(minAdvanceHours))) {
            throw new IllegalArgumentException("Date must be at least " + minAdvanceHours + " hours in the future");
        }
    }

    public void validateEndAt(LocalDateTime startAt, LocalDateTime endAt){
        if (endAt.isBefore(LocalDateTime.now())){
            throw new IllegalArgumentException("Date must be in the future");
        }
        if (endAt.isBefore(startAt)){
            throw new IllegalArgumentException("End at date must be greater than start at date");
        }
    }

    private void validateTimeWithinOpeningHours(
            LocalTime start,
            LocalTime end,
            List<OpeningHours> openingHoursForDay
    ) {
        boolean isValid = openingHoursForDay.stream().anyMatch(hours ->
                !start.isBefore(hours.getOpeningTime()) && !end.isAfter(hours.getClosingTime())
        );

        if (!isValid) {
            throw new IllegalArgumentException("The scheduling time is outside the allowed operating hours. sou eu");
        }
    }

    public void validateOperatingHours(SchedulingUpdateDTO requestDTO, Venue venue) {
        DayOfWeek day = requestDTO.startAt().getDayOfWeek();
        LocalTime start = requestDTO.startAt().toLocalTime();
        LocalTime end = requestDTO.endAt().toLocalTime();

        List<OpeningHours> openingHoursForDay = openingHoursRepository
                .findByVenue_VenueIdAndDayOfWeek(venue.getVenueId(), day);

        if (openingHoursForDay.isEmpty()) {
            throw new NotFoundException("No operating hours defined for the selected day.");
        }

        validateTimeWithinOpeningHours(start, end, openingHoursForDay);
    }


    public void validateSubVenueAvailability(SchedulingUpdateDTO updateDTO, Venue venue) {
        if (!venue.isDivisible()) {
            throw new IllegalArgumentException("Cannot book sub-venue on non-divisible venue");
        }

        SubVenue subVenue = venue.getSubVenues().stream()
                .filter(sv -> sv.getSubVenueId().equals(updateDTO.subVenueId()))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("SubVenue not found"));

        List<SchedulingRegisterRequest> conflicts = schedulingRegisterRequestRepository
                .findConflictingSubVenueSchedules(
                        subVenue,
                        updateDTO.startAt(),
                        updateDTO.endAt());

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("SubVenue already has scheduling in this period");
        }
    }

    public void validateVenueAvailability(SchedulingUpdateDTO updateDTO, Venue venue) {
        if (venue.isDivisible()) {
            // Para venues divisíveis, verifica todos sub-venues
            if (!venue.getSubVenues().isEmpty()) {
                boolean hasConflicts = venue.getSubVenues().stream()
                        .anyMatch(subVenue -> !schedulingRegisterRequestRepository
                                .findConflictingSubVenueSchedules(
                                        subVenue,
                                        updateDTO.startAt(),
                                        updateDTO.endAt())
                                .isEmpty());

                if (hasConflicts) {
                    throw new IllegalArgumentException("Venue has sub-venues with conflicts");
                }
            }
        } else {
            Optional<SchedulingRegisterRequest> conflicts = schedulingRegisterRequestRepository
                    .findExactMatchIfNotRejectedOrCancelled(
                            updateDTO.startAt(),
                            updateDTO.endAt(),
                            venue);

            if (conflicts.isPresent()) {
                throw new IllegalArgumentException("Venue already has scheduling in this period");
            }
        }
    }

    public void validateCompanyQuotaForUpdate(SchedulingUpdateDTO newRequestDTO,
                                              SchedulingRegisterRequest existingRequest,
                                              Venue venue) {
        Company company = userValidator.getAuthenticatedUser().getCompany();

        CompanyHoursQuota quota = companyHoursQuotaRepository.findByCompanyId(company.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Hours quota not found for this company"));

        double oldHours = calculateHours(existingRequest);
        double newHours = calculateNewScheduleHours(newRequestDTO, venue);
        double timeDifference = newHours - oldHours;

        if (timeDifference <= 0) return;

        YearMonth currentMonth = YearMonth.from(newRequestDTO.startAt());

        double consumedHours = monthlyUsageRepository.findByCompany_CompanyIdAndUsageMonth(company.getCompanyId(), currentMonth)
                .map(MonthlyUsageCompanyHours::getUsedHours)
                .orElse(0.0);

        double availableHours = quota.getMonthlyLimitHours() + quota.getAdditionalHoursApproved() - consumedHours;

        if (timeDifference > availableHours) {
            throw new IllegalArgumentException(
                    String.format("Company quota exceeded. Available: %.2fh, Required: %.2fh", availableHours, timeDifference)
            );
        }

        validateVenueTypeLimit(quota, venue.getVenueType(), timeDifference,
                newRequestDTO.startAt(), company.getCompanyId());
    }

    private double calculateHours(SchedulingRegisterRequest scheduling) {
        if (scheduling.getVenue().getVenueType() == VenueType.AUDITORIUM) {
            return scheduling.getBookingPeriod().getDurationInHours();
        }
        Duration duration = Duration.between(scheduling.getStartAt(), scheduling.getEndAt());
        return duration.toMinutes() / 60.0;
    }

    private double calculateNewScheduleHours(SchedulingUpdateDTO dto, Venue venue) {
        if (venue.getVenueType() == VenueType.AUDITORIUM) {
            if (dto.BookingPeriod() == null) {
                throw new IllegalArgumentException("Choose a shift for your auditorium scheduling(morning, afternoon or full time)");
            }
            return dto.BookingPeriod().getDurationInHours();
        }
        Duration duration = Duration.between(dto.startAt(), dto.endAt());
        return duration.toMinutes() / 60.0;
    }

    private void validateVenueTypeLimit(CompanyHoursQuota quota, VenueType venueType, double newHours,
                                        LocalDateTime startAt, UUID companyId) {
        YearMonth yearMonth = YearMonth.from(startAt);

        double used = monthlyUsageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(companyId, yearMonth, venueType)
                .map(MonthlyUsageCompanyHours::getUsedHours)
                .orElse(0.0);

        double limit = switch (venueType) {
            case AUDITORIUM -> quota.getMaxMonthlyHoursAuditorium();
            case MEETING_ROOM -> quota.getMaxMonthlyHoursMeetingRoom();
            case COWORKING -> quota.getMaxMonthlyHoursCoworking();
        };

        if (used + newHours > limit) {
            throw new IllegalArgumentException(
                    String.format("%s limit exceeded. Used: %.2fh / %.2fh", venueType, used + newHours, limit)
            );
        }
    }
}
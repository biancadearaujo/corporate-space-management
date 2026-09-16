package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.MonthlyUsageCompanyHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.repository.EquipmentRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.OpeningHours;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.OpeningHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingCreatorValidator {
    private VenueService venueService;
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private OpeningHoursRepository openingHoursRepository;
    private UserValidator userValidator;
    private MonthlyUsageCompanyHoursRepository monthlyUsageRepository;
    private CompanyRepository companyRepository;
    private EquipmentRepository equipmentRepository;

    public void validateCompanyIsActive(){
        User user = userValidator.getAuthenticatedUser();

        if (user.getCompany().isDeleted()) {
            throw new IllegalStateException(
                    "This user's company is disabled; new scheduling cannot be created.");
        }
    }

    public void validateStartAt(LocalDateTime date, Venue venue){
        int minAdvanceHours = venue.getMinimumHoursToCancel() != null ? venue.getMinimumHoursToCancel() : 96;
        if (date.isBefore(LocalDateTime.now().plusHours(minAdvanceHours))) {
            throw new IllegalArgumentException("Date must be at least " + minAdvanceHours + " hours in the future");
        }
    }

    public void validateStartAtManager(LocalDateTime date){
        if (date.isBefore(LocalDateTime.now())){
            throw new IllegalArgumentException("Date must be in the future");
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

    public void validateDate(SchedulingRegisterRequest schedulingRequest, Venue venue) {
        LocalDateTime startAt = schedulingRequest.getStartAt();
        int maximumMonths = getMaximumMonths(schedulingRequest, venue);

        LocalDateTime deadline = LocalDateTime.now()
                .plusMonths(maximumMonths)
                .withHour(23)
                .withMinute(59)
                .withSecond(59);

        if (startAt.isAfter(deadline)) {
            throw new IllegalArgumentException("The deadline for reservations has passed");
        }
    }

    private int getMaximumMonths(SchedulingRegisterRequest schedulingRequest, Venue venue){
        if (schedulingRequest.getSubVenue() != null) {
            SubVenue subVenue = schedulingRequest.getSubVenue();
            SubVenue foundSubVenue = venueService.findSubVenueOrThrow(subVenue.getSubVenueId(), venue);

            return foundSubVenue.getMaximumMonths() != null ?
                    foundSubVenue.getMaximumMonths() :
                    venue.getMaximumMonths();
        }
        return venue.getMaximumMonths();
    }

    private void validateTimeWithinOpeningHours(
            LocalTime schedulingStart,
            LocalTime schedulingEnd,
            List<OpeningHours> openingHoursForDay
    ) {
        boolean isValid = false;

        for (OpeningHours oh : openingHoursForDay) {
            LocalTime venueOpeningTime = oh.getOpeningTime();
            LocalTime venueClosingTime = oh.getClosingTime();

            boolean startsAtOrAfterOpening = !schedulingStart.isBefore(venueOpeningTime);
            boolean endsAtOrBeforeClosing = !schedulingEnd.isAfter(venueClosingTime);

            if (startsAtOrAfterOpening && endsAtOrBeforeClosing) {
                isValid = true;
                break;
            }
        }
        if (!isValid) {
            throw new IllegalArgumentException("The scheduling time is outside the allowed operating hours. ou é aqui");
        }
    }

    public void validateOperatingHours(SchedulingRegisterRequest schedulingRequest, Venue venue) {
        DayOfWeek day = schedulingRequest.getStartAt().getDayOfWeek();
        LocalTime start = schedulingRequest.getStartAt().toLocalTime();
        LocalTime end = schedulingRequest.getEndAt().toLocalTime();

        List<OpeningHours> openingHoursForDay = openingHoursRepository.findByVenue_VenueIdAndDayOfWeek(venue.getVenueId(), day);

        if (openingHoursForDay.isEmpty()) {
            throw new NotFoundException("No operating hours defined for the selected day.");
        }

        validateTimeWithinOpeningHours(start, end, openingHoursForDay);
    }

    public void validateCompanyQuota(SchedulingRegisterRequest schedulingRequest, Venue venue, Company company) {
        CompanyHoursQuota quota = companyHoursQuotaRepository.findByCompanyId(company.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Hours quota not found for this company"));

        double newHours = calculateNewScheduleHours(schedulingRequest, venue);

        YearMonth yearMonth = YearMonth.from(schedulingRequest.getStartAt());

        Double monthlyUsedTotal = monthlyUsageRepository.getTotalUsedHoursInMonth(company.getCompanyId(), yearMonth);
        double monthlyUsed = monthlyUsedTotal != null ? monthlyUsedTotal : 0.0;

        double totalAllowed = quota.getMonthlyLimitHours() + quota.getAdditionalHoursApproved();

        if (monthlyUsed + newHours > totalAllowed) {
            throw new IllegalArgumentException(
                    String.format("Global limit exceeded. Available: %.2fh (Limit: %.2fh + Extras: %.2fh)",
                            (totalAllowed - monthlyUsed),
                            quota.getMonthlyLimitHours(),
                            quota.getAdditionalHoursApproved())
            );
        }

        validateVenueTypeLimit(
                quota,
                venue.getVenueType(),
                newHours,
                schedulingRequest.getStartAt(),
                company.getCompanyId()
        );

        saveOrUpdateMonthlyUsage(company.getCompanyId(), schedulingRequest.getStartAt(), newHours, venue.getVenueType());
    }

    private double calculateNewScheduleHours(SchedulingRegisterRequest schedulingRequest, Venue venue) {
        if (venue.getVenueType() == VenueType.AUDITORIUM) {
            if (schedulingRequest.getBookingPeriod() == null) {
                throw new IllegalArgumentException("Choose a shift for your auditorium scheduling(morning, afternoon or full time)");
            }
            return schedulingRequest.getBookingPeriod().getDurationInHours();
        }
        Duration duration = Duration.between(schedulingRequest.getStartAt(), schedulingRequest.getEndAt());
        return duration.toMinutes() / 60.0;
    }

    private void saveOrUpdateMonthlyUsage(UUID companyId, LocalDateTime date, double addedHours, VenueType venueType) {
        YearMonth yearMonth = YearMonth.from(date);

        MonthlyUsageCompanyHours usage = monthlyUsageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(companyId, yearMonth, venueType)
                .orElseGet(() -> {
                    Company company = companyRepository.findById(companyId)
                            .orElseThrow(() -> new NotFoundException("Company not found"));

                    MonthlyUsageCompanyHours newUsage = new MonthlyUsageCompanyHours();
                    newUsage.setCompany(company);
                    newUsage.setUsageMonth(yearMonth);
                    newUsage.setVenueType(venueType);
                        newUsage.setUsedHours(0.0);
                    return newUsage;
                });

        usage.setUsedHours(usage.getUsedHours() + addedHours);
        usage.setUpdatedAt(LocalDateTime.now());
        monthlyUsageRepository.save(usage);
    }

    private void validateVenueTypeLimit(CompanyHoursQuota quota, VenueType venueType, double newHours,
                                        LocalDateTime startAt, UUID companyId) {

        YearMonth yearMonth = YearMonth.from(startAt);

        double used = monthlyUsageRepository
                .findByCompany_CompanyIdAndUsageMonthAndVenueType(companyId, yearMonth, venueType)
                .map(MonthlyUsageCompanyHours::getUsedHours)
                .orElse(0.0);

        double maxAllowed = switch (venueType) {
            case AUDITORIUM -> quota.getMaxMonthlyHoursAuditorium();
            case MEETING_ROOM -> quota.getMaxMonthlyHoursMeetingRoom();
            case COWORKING -> quota.getMaxMonthlyHoursCoworking();
        };

        if (used + newHours > maxAllowed) {
            throw new IllegalArgumentException(String.format(
                    "%s limit exceeded. Used: %.2fh / %.2fh",
                    venueType,
                    (used + newHours),
                    maxAllowed
            ));
        }
    }

    public void validateSubVenueAvailability(SchedulingRegisterRequest scheduling, Venue venue) {
        SubVenue subVenue = scheduling.getSubVenue();

        if (subVenue == null) {
            throw new IllegalStateException
                    ("SubVenue cannot be null for sub-venue specific validation. This indicates a logic error upstream.");
        }

        List<SchedulingRegisterRequest> existing = schedulingRegisterRequestRepository.findAllBySubVenueAndDate(
                subVenue,
                scheduling.getStartAt().toLocalDate()
        );

        if (venue.getVenueType() == VenueType.AUDITORIUM) {
            for (SchedulingRegisterRequest s : existing) {
                if (s.getBookingPeriod() == scheduling.getBookingPeriod()) {
                    throw new IllegalArgumentException
                            ("There is already a schedule for this period in the auditorium (subspace).");
                }
            }
        } else {
            for (SchedulingRegisterRequest s : existing) {
                boolean overlaps = scheduling.getStartAt().isBefore(s.getEndAt())
                        && scheduling.getEndAt().isAfter(s.getStartAt());
                if (overlaps) {
                    throw new IllegalArgumentException("There is already a schedule at that time for that subspace.");
                }
            }
        }
    }

    public void validateVenueAvailability(SchedulingRegisterRequest schedulingRequest, Venue venue) {
        List<SchedulingRegisterRequest> existing = schedulingRegisterRequestRepository.findAllByVenueAndDate(
                venue,
                schedulingRequest.getStartAt().toLocalDate()
        );

        if (venue.getVenueType() == VenueType.AUDITORIUM) {
            for (SchedulingRegisterRequest s : existing) {
                if (s.getBookingPeriod() == schedulingRequest.getBookingPeriod()) {
                    throw new IllegalArgumentException("There is already a schedule for this period in the auditorium.");
                }
            }
        } else {
            for (SchedulingRegisterRequest s : existing) {
                boolean overlaps =
                        schedulingRequest.getStartAt().isBefore(s.getEndAt())
                                && schedulingRequest.getEndAt().isAfter(s.getStartAt());
                if (overlaps) {
                    throw new IllegalArgumentException("There is already an appointment at that time.");
                }
            }
        }
    }

    public void validateEquipments(List<UUID> equipmentIds, Venue venue, LocalDateTime startAt, LocalDateTime endAt) {
        if (equipmentIds == null || equipmentIds.isEmpty()) return;

        List<Equipment> equipments = equipmentRepository.findAllById(equipmentIds);

        if (equipments.size() != equipmentIds.size()) {
            throw new NotFoundException("One or more equipment IDs are invalid.");
        }

        for (Equipment eq : equipments) {
            if (eq.getVenue() != null && !eq.getVenue().getVenueId().equals(venue.getVenueId())) {
                throw new IllegalArgumentException("Equipment '" + eq.getName() + "' does not belong to the selected venue.");
            }

            if (!eq.getAvailable()) {
                throw new IllegalArgumentException("Equipment '" + eq.getName() + "' is currently unavailable/broken.");
            }

            boolean isBooked = eq.getSchedulings().stream().anyMatch(sched ->
                    startAt.isBefore(sched.getEndAt()) && endAt.isAfter(sched.getStartAt())
            );

            if (isBooked) {
                throw new IllegalArgumentException("Equipment '" + eq.getName() + "' is already booked for this period.");
            }
        }
    }
}
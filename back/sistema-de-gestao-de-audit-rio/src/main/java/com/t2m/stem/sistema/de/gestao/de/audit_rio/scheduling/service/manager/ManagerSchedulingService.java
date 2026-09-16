package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyHoursQuotaService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.MonthlyUsageCompanyHoursService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.factory.ManagerSchedulingFactory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.BookingPeriod;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.ManagerSchedulingValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.SchedulingValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.enums.VenueType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerSchedulingService {
    private UserValidator userValidator;
    private VenueService venueService;
    private ManagerSchedulingValidator managerSchedulingValidator;
    private ManagerSchedulingFactory managerSchedulingFactory;
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private SchedulingRepository schedulingRepository;
    private SchedulingValidator schedulingValidator;
    private CompanyHoursQuotaService companyHoursQuotaService;
    private MonthlyUsageCompanyHoursService monthlyUsageCompanyHoursService;

    public Page<SchedulingResponseDTO> getAllScheduling(Pageable pageable) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return schedulingRepository.findAllByCompanyCompanyId(companyId, pageable)
                .map(SchedulingResponseDTO::from);
    }

    public Page<SchedulingRegisterResponseDTO> getAllRequestScheduling(Pageable pageable) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return schedulingRegisterRequestRepository.findAllByCompanyCompanyId(companyId, pageable)
                .map(SchedulingRegisterResponseDTO::from);
    }

    public List<SchedulingRegisterResponseDTO> getSchedulingByStatus(SchedulingRequestStatus status) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<SchedulingRegisterRequest> schedulingRegisterRequests = schedulingRegisterRequestRepository
                .findByStatusAndCompanyCompanyId(status, companyId);

        return schedulingRegisterRequests.stream()
                .map(SchedulingRegisterResponseDTO::from)
                .toList();
    }

    public List<SchedulingRegisterResponseDTO> getSchedulingByStatusPending(){
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<SchedulingRegisterRequest> schedulingRegisterRequests = schedulingRegisterRequestRepository
                .findByStatusAndCompanyCompanyId(SchedulingRequestStatus.PENDING, companyId);

        return schedulingRegisterRequests.stream()
                .map(SchedulingRegisterResponseDTO::from)
                .toList();
    }

    public SchedulingResponseDTO getSchedulingById(UUID schedulingId) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return schedulingRepository.findBySchedulingIdAndCompanyCompanyId(schedulingId, companyId)
                .map(SchedulingResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }

    public SchedulingRegisterResponseDTO findByRequestSchedulingId(UUID schedulingId) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return schedulingRegisterRequestRepository
                .findBySchedulingIdAndCompanyCompanyId(schedulingId, companyId)
                .map(SchedulingRegisterResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }

    //TODO: Testar e colocar validação para ver ser realmente é um gerente.
    public SchedulingRegisterResponseDTO managerSchedulingRegistrationRequest(SchedulingRegisterRequestDTO requestDTO){
        User currentUser = userValidator.getAuthenticatedUser();
        Venue venue = venueService.findById(requestDTO.venueId());

        SchedulingRegisterRequest schedulingRegisterRequest = managerSchedulingFactory.create(requestDTO,
                currentUser, venue);

        managerSchedulingValidator.managerValidateForCreate(schedulingRegisterRequest, venue);

        Scheduling scheduling = managerSchedulingFactory.createSchedulingFromRequest(schedulingRegisterRequest);

        SchedulingRegisterRequest registerRequest = schedulingRegisterRequestRepository.save(schedulingRegisterRequest);

        scheduling.setRegisterRequest(registerRequest);
        registerRequest.setScheduling(scheduling);

        schedulingRepository.save(scheduling);
        companyHoursQuotaService.updateConsumedHoursForCurrentMonth(currentUser.getCompany());

        return SchedulingRegisterResponseDTO.from(registerRequest);
    }

    //TODO: Testar.
    public SchedulingRegisterResponseDTO schedulingUpdate(UUID schedulingId, SchedulingUpdateDTO schedulingUpdateDTO) {
        SchedulingRegisterRequest schedulingRequest = schedulingRegisterRequestRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found."));

        Venue venue;
        if (schedulingUpdateDTO.venueId() != null) {
            venue = venueService.findById(schedulingUpdateDTO.venueId());
        }else {
            venue = schedulingRequest.getVenue();
        }
        managerSchedulingValidator.managerValidateForUpdate(schedulingId, schedulingUpdateDTO, venue);

        if (schedulingUpdateDTO.name() != null) {
            schedulingRequest.setName(schedulingUpdateDTO.name());
        }
        if (schedulingUpdateDTO.description() != null) {
            schedulingRequest.setDescription(schedulingUpdateDTO.description());
        }
        if (schedulingUpdateDTO.startAt() != null) {
            schedulingRequest.setStartAt(schedulingUpdateDTO.startAt());
        }
        if (schedulingUpdateDTO.endAt() != null) {
            schedulingRequest.setEndAt(schedulingUpdateDTO.endAt());
        }
        if (schedulingUpdateDTO.venueId() != null) {
            schedulingRequest.setVenue(venue);
        }

        schedulingRequest.setUpdateAt(LocalDateTime.now());

        SchedulingRegisterRequest schedulingRegisterRequest = schedulingRegisterRequestRepository.save(schedulingRequest);

        return SchedulingRegisterResponseDTO.from(schedulingRegisterRequest);
    }

    @Transactional
    public void schedulingDeleteRequest (UUID schedulingId){
        Scheduling scheduling = findBySchedulingId(schedulingId);
        SchedulingRegisterRequest schedulingRegisterRequest = scheduling.getRegisterRequest();
        Venue venue = scheduling.getVenue();
        Company company = scheduling.getCompany();

        schedulingValidator.validateForDelete(scheduling.getStartAt(), venue);

        double durationHours = calculateDurationInHours(
                scheduling.getStartAt(),
                scheduling.getEndAt(),
                venue.getVenueType(),
                scheduling.getBookingPeriod());

        if (venue.getVenueType() != null) {
            monthlyUsageCompanyHoursService.releaseUsedHours(
                    company,
                    venue.getVenueType(),
                    durationHours,
                    scheduling.getStartAt()
            );
        }

        schedulingRegisterRequest.setScheduling(null);
        schedulingRegisterRequest.setStatus(SchedulingRequestStatus.CANCELLED);
        schedulingRegisterRequestRepository.save(schedulingRegisterRequest);

        schedulingRepository.delete(scheduling);
    }

    private double calculateDurationInHours(LocalDateTime start, LocalDateTime end, VenueType venueType,
                                            BookingPeriod bookingPeriod) {
        if (venueType == VenueType.AUDITORIUM && bookingPeriod != null) {
            return bookingPeriod.getDurationInHours();
        }

        Duration duration = Duration.between(start, end);
        return duration.toMinutes() / 60.0;
    }

    private Scheduling findBySchedulingId(UUID schedulingId) {
        return schedulingRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }
}
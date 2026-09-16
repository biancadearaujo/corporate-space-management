package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyHoursQuotaService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.factory.SchedulingFactory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRejectedRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.*;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRejectedRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.SchedulingValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingService {
    private SchedulingRepository schedulingRepository;
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private VenueService venueService;
    private SchedulingValidator schedulingValidator;
    private SchedulingFactory schedulingFactory;
    private UserValidator userValidator;
    private CompanyHoursQuotaService companyHoursQuotaService;
    private SchedulingRejectedRequestRepository schedulingRejectedRequestRepository;

    public Page<SchedulingResponseDTO> getAllScheduling(Pageable pageable) {
        return schedulingRepository.findAll(pageable)
                .map(SchedulingResponseDTO::from);
    }

    public List<SchedulingRegisterResponseDTO> getSchedulingByStatus(SchedulingRequestStatus status) {
        List<SchedulingRegisterRequest> schedulingRegisterRequests = schedulingRegisterRequestRepository.findByStatus(status);

        if (schedulingRegisterRequests.isEmpty()) {
            throw new NotFoundException("Status not found");
        }

        return schedulingRegisterRequests.stream()
                .map(SchedulingRegisterResponseDTO::from)
                .toList();
    }

    public List<SchedulingRegisterResponseDTO> getSchedulingByStatusPending(){
        List<SchedulingRegisterRequest> schedulingRegisterRequests = schedulingRegisterRequestRepository
                .findByStatus(SchedulingRequestStatus.PENDING);

        return schedulingRegisterRequests.stream()
                .map(SchedulingRegisterResponseDTO::from)
                .toList();
    }

    public SchedulingResponseDTO getSchedulingById(UUID schedulingId) {
        return schedulingRepository.findById(schedulingId)
                .map(SchedulingResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }

    public SchedulingRegisterRequest findBySchedulingRequestId(UUID schedulingId) {
        return schedulingRegisterRequestRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }

//    public SchedulingRegisterResponseDTO schedulingRegistrationRequest(SchedulingRegisterRequestDTO requestDTO) {
//        User currentUser = userValidator.getAuthenticatedUser();
//        Venue venue = venueService.findById(requestDTO.venueId());
//
//        schedulingValidator.validateForCreate(requestDTO, venue);
//
//        SchedulingRegisterRequest scheduling = schedulingFactory.create(requestDTO, currentUser, venue);
//        SchedulingRegisterRequest schedulingRegisterRequest = schedulingRegisterRequestRepository.save(scheduling);
//
//        return SchedulingRegisterResponseDTO.from(schedulingRegisterRequest);
//    }

    @Transactional
    public SchedulingRegisterResponseDTO schedulingUpdateRequest(UUID schedulingId, SchedulingUpdateDTO schedulingUpdateDTO) {
        SchedulingRegisterRequest schedulingRequest = schedulingRegisterRequestRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));

        Venue venue;
        if (schedulingUpdateDTO.venueId() != null) {
            venue = venueService.findById(schedulingUpdateDTO.venueId());
        }else {
            venue = schedulingRequest.getVenue();
        }
        schedulingValidator.validateForUpdate(schedulingId, schedulingUpdateDTO, venue);

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

//    @Transactional
//    public void schedulingDeleteRequest (UUID schedulingId){
//        Scheduling scheduling = findBySchedulingId(schedulingId);
//        SchedulingRegisterRequest schedulingRegisterRequest = scheduling.getRegisterRequest();
//        Venue venue = scheduling.getVenue();
//        Company company = scheduling.getCompany();
//
//        schedulingValidator.validateForDelete(scheduling.getStartAt(), venue);
//
//        int durationHours = (int) ChronoUnit.HOURS.between(scheduling.getStartAt(), scheduling.getEndAt());
//        companyHoursQuotaService.releaseHours(company, durationHours);
//
//        schedulingRegisterRequest.setScheduling(null);
//        schedulingRegisterRequest.setStatus(SchedulingRequestStatus.CANCELLED);
//        schedulingRegisterRequestRepository.save(schedulingRegisterRequest);
//
//        schedulingRepository.delete(scheduling);
//    }

    private Scheduling findBySchedulingId(UUID schedulingId) {
        return schedulingRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }
}
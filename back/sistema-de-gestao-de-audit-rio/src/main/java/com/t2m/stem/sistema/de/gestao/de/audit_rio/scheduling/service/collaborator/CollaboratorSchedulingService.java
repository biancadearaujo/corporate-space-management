package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.CompanyHoursQuota;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.MonthlyUsageDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.QuotaUsageDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyHoursQuotaRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.MonthlyUsageCompanyHoursRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyHoursQuotaService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.MonthlyUsageCompanyHoursService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.factory.SchedulingFactory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRejectedRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.*;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRejectedRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.SchedulingPermissionValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator.SchedulingValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.VenueService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class CollaboratorSchedulingService {
    private SchedulingRepository schedulingRepository;
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private VenueService venueService;
    private SchedulingValidator schedulingValidator;
    private SchedulingFactory schedulingFactory;
    private UserValidator userValidator;
    private CompanyHoursQuotaService companyHoursQuotaService;
    private SchedulingPermissionValidator schedulingPermissionValidator;
    private MonthlyUsageCompanyHoursService monthlyUsageCompanyHoursService;
    private CompanyService companyService;
    private SchedulingRejectedRequestRepository schedulingRejectedRequestRepository;
    private CompanyHoursQuotaRepository companyHoursQuotaRepository;
    private MonthlyUsageCompanyHoursRepository monthlyUsageRepository;

    public Page<SchedulingResponseDTO> getAllScheduling(Pageable pageable) {
        User currentUser = userValidator.getAuthenticatedUser();
        Company company = currentUser.getCompany();

        userValidator.validateCollaborator(currentUser.getUserId());

        return schedulingRepository.findByCreatedByAndCompanyCompanyId(currentUser.getUserId(),
                        company.getCompanyId(),pageable)
                .map(SchedulingResponseDTO::from);
    }

    public Page<UnifiedSchedulingDTO> searchAllUnifiedScheduling(Pageable pageable) {
        User currentUser = userValidator.getAuthenticatedUser();
        Company company = currentUser.getCompany();

        userValidator.validateCollaborator(currentUser.getUserId());

        // Busca todos os dados
        List<UnifiedSchedulingDTO> approvedList = fetchApprovedSchedulings(currentUser, company);
        List<UnifiedSchedulingDTO> pendingList = fetchPendingRequests(currentUser, company);
        List<UnifiedSchedulingDTO> rejectedList = fetchRejectedRequests(currentUser, company);

        // Junta e ordena
        List<UnifiedSchedulingDTO> unifiedList = mergeAndSortSchedulingLists(approvedList, pendingList, rejectedList);

        // Lógica de Paginação Manual (List -> Page)
        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), unifiedList.size());

        List<UnifiedSchedulingDTO> pageContent;
        if (start > unifiedList.size()) {
            pageContent = new ArrayList<>();
        } else {
            pageContent = unifiedList.subList(start, end);
        }

        return new PageImpl<>(pageContent, pageable, unifiedList.size());
    }

    public SchedulingResponseDTO getSchedulingById(UUID schedulingId) {
        User currentUser = userValidator.getAuthenticatedUser();
        Company company = currentUser.getCompany();

        userValidator.validateCollaborator(currentUser.getUserId());

        return schedulingRepository
                .findByCreatedByAndSchedulingIdAndCompany(currentUser.getUserId(), schedulingId, company)
                .map(SchedulingResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }

    public List<SchedulingRegisterResponseDTO> getSchedulingByStatus(SchedulingRequestStatus status) {
        User currentUser = userValidator.getAuthenticatedUser();
        Company company = currentUser.getCompany();

        userValidator.validateCollaborator(currentUser.getUserId());

        List<SchedulingRegisterRequest> schedulingRegisterRequests = schedulingRegisterRequestRepository
                .findByStatusAndCompanyAndCreatedBy(status, company, currentUser.getUserId());

        return schedulingRegisterRequests.stream()
                .map(SchedulingRegisterResponseDTO::from)
                .toList();
    }

    public QuotaUsageDTO getCurrentMonthQuota() {
        Company company = userValidator.getAuthenticatedUser().getCompany();

        CompanyHoursQuota quota = companyHoursQuotaRepository.findByCompanyId(company.getCompanyId())
                .orElseThrow(() -> new NotFoundException("Hours quota not found for this company"));

        YearMonth currentMonth = YearMonth.now();

        Double monthlyUsedTotal = monthlyUsageRepository.getTotalUsedHoursInMonth(company.getCompanyId(), currentMonth);
        double used = monthlyUsedTotal != null ? monthlyUsedTotal : 0.0;

        double total = quota.getMonthlyLimitHours() + quota.getAdditionalHoursApproved();

        return new QuotaUsageDTO(used, total);
    }

    @Transactional
    public SchedulingRegisterResponseDTO schedulingRegistrationRequest(SchedulingRegisterRequestDTO requestDTO) {
        User currentUser = userValidator.getAuthenticatedUser();
        Venue venue = venueService.findById(requestDTO.venueId());

        userValidator.validateCollaborator(currentUser.getUserId());

        SchedulingRegisterRequest scheduling = schedulingFactory.create(requestDTO, currentUser, venue);

        schedulingValidator.validateForCreate(scheduling, venue, requestDTO.equipmentIds());

        SchedulingRegisterRequest schedulingRegisterRequest = schedulingRegisterRequestRepository.save(scheduling);
        companyHoursQuotaService.updateConsumedHoursForCurrentMonth(currentUser.getCompany());

        return SchedulingRegisterResponseDTO.from(schedulingRegisterRequest);
    }

    @Transactional
    public SchedulingRegisterResponseDTO schedulingUpdateRequest(UUID schedulingId,
                                                                 SchedulingUpdateDTO schedulingUpdateDTO) {

        SchedulingRegisterRequest schedulingRequest = schedulingRegisterRequestRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));

        schedulingPermissionValidator.ValidateAccessToSchedulingUpdates(schedulingRequest);

        if (schedulingRequest.getScheduling() != null) {
            throw new IllegalArgumentException("Cannot update request after it has been approved by a manager.");
        }

        Venue venue = schedulingUpdateDTO.venueId() != null
                ? venueService.findById(schedulingUpdateDTO.venueId())
                : schedulingRequest.getVenue();

        schedulingValidator.validateForUpdate(schedulingId, schedulingUpdateDTO, venue);

        double oldHours = monthlyUsageCompanyHoursService.calculateHours(
                schedulingRequest.getStartAt(),
                schedulingRequest.getEndAt(),
                schedulingRequest.getVenue().getVenueType()
        );

        monthlyUsageCompanyHoursService.releaseUsedHours(
                schedulingRequest.getCompany(),
                schedulingRequest.getVenue().getVenueType(),
                oldHours,
                schedulingRequest.getStartAt()
        );

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

        double newHours = monthlyUsageCompanyHoursService.calculateHours(
                schedulingRequest.getStartAt(),
                schedulingRequest.getEndAt(),
                schedulingRequest.getVenue().getVenueType()
        );

        monthlyUsageCompanyHoursService.saveOrUpdateMonthlyUsageRequest(
                schedulingRequest.getCompany().getCompanyId(),
                schedulingRequest.getStartAt(),
                schedulingRequest.getVenue().getVenueType(),
                newHours
        );

        SchedulingRegisterRequest updatedRequest = schedulingRegisterRequestRepository.save(schedulingRequest);
        companyHoursQuotaService.updateConsumedHoursForCurrentMonth(userValidator.getAuthenticatedUser().getCompany());
        return SchedulingRegisterResponseDTO.from(updatedRequest);
    }

    @Transactional
    public void schedulingDeleteRequest (UUID schedulingId){
        Scheduling scheduling = findBySchedulingId(schedulingId);
        schedulingPermissionValidator.validateAccessToSchedulingDelete(scheduling);

        SchedulingRegisterRequest schedulingRegisterRequest = scheduling.getRegisterRequest();
        Venue venue = scheduling.getVenue();
        Company company = scheduling.getCompany();

        schedulingValidator.validateForDelete(scheduling.getStartAt(), venue);

        double durationHours = monthlyUsageCompanyHoursService.calculateHours(scheduling.getStartAt(),
                scheduling.getEndAt(), venue.getVenueType());

        monthlyUsageCompanyHoursService.releaseUsedHours(
                company,
                venue.getVenueType(),
                durationHours,
                scheduling.getStartAt()
        );

        schedulingRegisterRequest.setScheduling(null);
        schedulingRegisterRequest.setStatus(SchedulingRequestStatus.CANCELLED);
        schedulingRegisterRequestRepository.save(schedulingRegisterRequest);

        schedulingRepository.delete(scheduling);
        companyHoursQuotaService.updateConsumedHoursForCurrentMonth(userValidator.getAuthenticatedUser().getCompany());
    }

    @Transactional
    public void deletePendingRequest(UUID requestId) {
        SchedulingRegisterRequest request = schedulingRegisterRequestRepository.findById(requestId)
                .orElseThrow(() -> new NotFoundException("Request not found. Invalid ID."));

        User currentUser = userValidator.getAuthenticatedUser();
        if (!request.getCreatedBy().equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("You can only delete your own requests.");
        }

        if (request.getStatus() != SchedulingRequestStatus.PENDING) {
            throw new IllegalArgumentException("It cannot be deleted. The status is not PENDING.");
        }

        schedulingRegisterRequestRepository.delete(request);
    }

    private Scheduling findBySchedulingId(UUID schedulingId) {
        return schedulingRepository.findById(schedulingId)
                .orElseThrow(() -> new NotFoundException("Scheduling not found"));
    }

    private List<UnifiedSchedulingDTO> fetchApprovedSchedulings(User user, Company company) {
        return schedulingRepository
                .findByCreatedByAndCompanyCompanyId(user.getUserId(), company.getCompanyId(), Pageable.unpaged())
                .stream()
                .map(this::mapSchedulingToUnifiedDTO)
                .toList();
    }

    private List<UnifiedSchedulingDTO> fetchPendingRequests(User user, Company company) {
        return schedulingRegisterRequestRepository
                .findByStatusAndCompanyAndCreatedBy(SchedulingRequestStatus.PENDING, company, user.getUserId())
                .stream()
                .map(this::mapRegisterRequestToUnifiedDTO)
                .toList();
    }

    private List<UnifiedSchedulingDTO> fetchRejectedRequests(User user, Company company) {
        return schedulingRejectedRequestRepository
                .findByCompanyAndCreatedBy(company, user.getUserId())
                .stream()
                .map(this::mapRejectedRequestToUnifiedDTO)
                .toList();
    }

    private UnifiedSchedulingDTO mapSchedulingToUnifiedDTO(Scheduling scheduling) {
        return new UnifiedSchedulingDTO(
                scheduling.getSchedulingId(),
                scheduling.getName(),
                scheduling.getDescription(),
                scheduling.getStartAt(),
                scheduling.getEndAt(),
                getVenueName(scheduling.getVenue()),
                "APPROVED",
                "SCHEDULING"
        );
    }

    private UnifiedSchedulingDTO mapRegisterRequestToUnifiedDTO(SchedulingRegisterRequest schedulingRegisterRequest) {
        return new UnifiedSchedulingDTO(
                schedulingRegisterRequest.getSchedulingId(),
                schedulingRegisterRequest.getName(),
                schedulingRegisterRequest.getDescription(),
                schedulingRegisterRequest.getStartAt(),
                schedulingRegisterRequest.getEndAt(),
                getVenueName(schedulingRegisterRequest.getVenue()),
                schedulingRegisterRequest.getStatus().name(),
                "REQUEST"
        );
    }

    private UnifiedSchedulingDTO mapRejectedRequestToUnifiedDTO(SchedulingRejectedRequest schedulingRejectedRequest) {
        return new UnifiedSchedulingDTO(
                schedulingRejectedRequest.getSchedulingRejectedRequestId(),
                schedulingRejectedRequest.getName(),
                schedulingRejectedRequest.getDescription(),
                schedulingRejectedRequest.getStartAt(),
                schedulingRejectedRequest.getEndAt(),
                getVenueName(schedulingRejectedRequest.getVenue()),
                schedulingRejectedRequest.getStatus() != null ? schedulingRejectedRequest.getStatus().name() : "REJECTED",
                "REJECTED"
        );
    }

    private String getVenueName(Venue venue) {
        return venue != null ? venue.getName() : "N/A";
    }

    @SafeVarargs
    private List<UnifiedSchedulingDTO> mergeAndSortSchedulingLists(List<UnifiedSchedulingDTO>... lists) {
        List<UnifiedSchedulingDTO> unifiedList = new ArrayList<>();
        for (List<UnifiedSchedulingDTO> list : lists) {
            unifiedList.addAll(list);
        }
        unifiedList.sort((a, b) -> b.startAt().compareTo(a.startAt()));
        return unifiedList;
    }
}
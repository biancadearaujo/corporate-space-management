package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.MonthlyUsageCompanyHoursService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.Notification;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.enums.NotificationType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.repository.NotificationRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRejectedResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRejectedRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRejectedRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.dto.SchedulingRegisterRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.repository.SchedulingRegisterRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.enums.SchedulingRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingApprovalService {
    private SchedulingRegisterRequestRepository schedulingRegisterRequestRepository;
    private SchedulingRepository schedulingRepository;
    private UserValidator userValidator;
    private SchedulingRejectedRequestRepository schedulingRejectedRequestRepository;
    private MonthlyUsageCompanyHoursService monthlyUsageCompanyHoursService;
    private NotificationRepository notificationRepository;
    private UserRepository userRepository;

    @Transactional
    public SchedulingResponseDTO approveScheduling(UUID id) {
        SchedulingRegisterRequest request = validateScheduling(id, schedulingRegisterRequestRepository);
        User currentUser = userValidator.getAuthenticatedUser();

        if (!currentUser.getRole().equals(UserRole.MANAGER)) {
            throw new IllegalArgumentException("Only managers can approve requests.");
        }
        if (!request.getCompany().getCompanyId().equals(currentUser.getCompany().getCompanyId())) {
            throw new IllegalArgumentException("Only managers from the same company can approve requests.");
        }

        Scheduling scheduling = buildSchedulingFromRequest(request);
        updateRequestAsApproved(request, currentUser);

        schedulingRegisterRequestRepository.save(request);
        Scheduling created = schedulingRepository.save(scheduling);

        User recipient = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new NotFoundException("User not found for notification"));

        sendNotification(
                recipient,
                "Agendamento Aprovado!",
                "Sua solicitação para " + request.getVenue().getName() + " foi aprovada pelo gestor.",
                NotificationType.SUCCESS
        );

        return SchedulingResponseDTO.from(created);
    }

    @Transactional
    public SchedulingRejectedResponseDTO rejectScheduling(UUID id, SchedulingRegisterRequestDTO dto) {
        SchedulingRegisterRequest request = validateScheduling(id, schedulingRegisterRequestRepository);
        User user = userValidator.getAuthenticatedUser();

        monthlyUsageCompanyHoursService.releaseCompanyHours(request);

        SchedulingRejectedRequest rejectedRequest = buildRejectedRequest(request, dto, user);
        updateRegisterRequestAsRejected(request, dto, user);

        schedulingRejectedRequestRepository.save(rejectedRequest);
        schedulingRegisterRequestRepository.save(request);

        User recipient = userRepository.findById(request.getCreatedBy())
                .orElseThrow(() -> new NotFoundException("User not found for notification"));

        sendNotification(
                recipient,
                "Agendamento Recusado",
                "Sua solicitação para " + request.getVenue().getName() + " foi recusada. Motivo: " + dto.rejectionReason(),
                NotificationType.WARNING
        );

        return SchedulingRejectedResponseDTO.from(rejectedRequest);
    }

    public List<SchedulingRegisterResponseDTO> getPendingSchedulingRequests() {
        List<SchedulingRegisterRequest> requests = schedulingRegisterRequestRepository
                .findByStatus(SchedulingRequestStatus.PENDING);

        return requests.stream()
                .map(SchedulingRegisterResponseDTO::from)
                .toList();
    }

    private Scheduling buildSchedulingFromRequest(SchedulingRegisterRequest request) {
        Scheduling scheduling = new Scheduling();
        scheduling.setName(request.getName());
        scheduling.setDescription(request.getDescription());
        scheduling.setStartAt(request.getStartAt());
        scheduling.setEndAt(request.getEndAt());
        scheduling.setCreatedAt(LocalDateTime.now());
        scheduling.setCompany(request.getCompany());
        scheduling.setVenue(request.getVenue());
        scheduling.setRegisterRequest(request);
        scheduling.setCreatedBy(request.getCreatedBy());
        return scheduling;
    }

    private SchedulingRejectedRequest buildRejectedRequest(SchedulingRegisterRequest request,
                                                           SchedulingRegisterRequestDTO dto,
                                                           User user) {
        SchedulingRejectedRequest rejected = new SchedulingRejectedRequest();
        rejected.setName(request.getName());
        rejected.setDescription(request.getDescription());
        rejected.setStartAt(request.getStartAt());
        rejected.setEndAt(request.getEndAt());
        rejected.setCreatedAt(LocalDateTime.now());
        rejected.setCreatedBy(request.getCreatedBy());
        rejected.setCompany(user.getCompany());
        rejected.setVenue(request.getVenue());
        rejected.setStatus(SchedulingRequestStatus.REJECTED);
        rejected.setDecidedAt(LocalDateTime.now());
        rejected.setDecidedBy(user.getUserId());
        rejected.setRejectionReason(dto.rejectionReason());
        return rejected;
    }

    private void sendNotification(User recipient, String title, String message, NotificationType type) {
        Notification notification = new Notification();
        notification.setRecipient(recipient);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setRead(false);
        notification.setCreatedAt(LocalDateTime.now());

        notificationRepository.save(notification);
    }

    private void updateRequestAsApproved(SchedulingRegisterRequest request, User user) {
        request.setStatus(SchedulingRequestStatus.APPROVED);
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedBy(user.getUserId());
    }

    private void updateRegisterRequestAsRejected(SchedulingRegisterRequest request,
                                                 SchedulingRegisterRequestDTO dto, User user) {
        request.setStatus(SchedulingRequestStatus.REJECTED);
        request.setDecidedAt(LocalDateTime.now());
        request.setDecidedBy(user.getUserId());
        request.setRejectionReason(dto.rejectionReason());
    }

    private SchedulingRegisterRequest validateScheduling(
            UUID id,
            SchedulingRegisterRequestRepository schedulingRequestRepository
    ){
        SchedulingRegisterRequest schedulingRegisterRequest = schedulingRequestRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Scheduling registration request not found."));

        if (schedulingRegisterRequest.getStatus() != SchedulingRequestStatus.PENDING) {
            throw new IllegalArgumentException("Error: Scheduling registration request already processed.");
        }
        return schedulingRegisterRequest;
    }
}
package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.AdditionalHoursRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.HoursApprovalHistory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.ApprovalAction;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.AdditionalHoursRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.HoursApprovalHistoryRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.AdditionalHoursRequestService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.validator.CompanyMembershipValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.Notification;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.enums.NotificationType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.repository.NotificationRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerHoursRequestService {
    private CompanyMembershipValidator companyMembershipValidator;
    private AdditionalHoursRequestRepository additionalHoursRequestRepository;
    private HoursApprovalHistoryRepository hoursApprovalHistoryRepository;
    private UserValidator userValidator;
    private AdditionalHoursRequestService additionalHoursRequestService;
    private NotificationRepository notificationRepository;
    private UserRepository userRepository;

    public Page<AdditionalHoursResponseDTO> getAllAdditionalHoursRequest(Pageable pageable) {
        userValidator.validateManagerAccess();
        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return additionalHoursRequestRepository.findByCompanyId(companyId, pageable)
                .map(request -> {
                    String name = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, name);
                });
    }

    public List<AdditionalHoursResponseDTO> getAdditionalRequestByStatus(AdditionalHoursRequestStatus status){
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository
                .findByStatusAndCompanyId(status, companyId);

        return additionalHoursRequests.stream()
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                })
                .toList();
    }

    public AdditionalHoursResponseDTO getAdditionalHoursRequestById(UUID additionalHoursRequestId) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return additionalHoursRequestRepository.findByAdditionalHoursRequestIdAndCompanyId(additionalHoursRequestId, companyId)
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                })
                .orElseThrow(() -> new NotFoundException("Additional Hours Request not found"));
    }

    public List<AdditionalHoursResponseDTO> getAllAdditionalHoursRequestsByUserId(UUID userId) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        companyMembershipValidator.validateUserCompany(userId, companyId);

        String requesterName = userRepository.findById(userId)
                .map(User::getUsername)
                .orElse("Usuário Desconhecido");

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository
                .findByRequesterIdAndCompanyId(userId, companyId);

        return additionalHoursRequests.stream()
                .map(request -> AdditionalHoursResponseDTO.from(request, requesterName))
                .toList();
    }

    public List<AdditionalHoursResponseDTO> getReviewRequest(){
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<AdditionalHoursRequest> requests = additionalHoursRequestRepository
                .findByStatusAndCompanyId(AdditionalHoursRequestStatus.PENDING_MANAGER_REVIEW, companyId);

        return requests.stream()
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                })
                .toList();
    }

    @Transactional
    public AdditionalHoursResponseDTO managerDirectRequest(AdditionalHoursRequestDTO additionalHoursRequestDTO) {
        User currentUser = userValidator.getAuthenticatedUser();

        companyMembershipValidator.validateManagerCompany(currentUser.getUserId(),
                currentUser.getCompany().getCompanyId());

        AdditionalHoursRequest additionalHoursRequest = new AdditionalHoursRequest();

        additionalHoursRequest.setCompanyId(currentUser.getCompany().getCompanyId());
        additionalHoursRequest.setRequesterId(currentUser.getUserId());
        additionalHoursRequest.setRequestedHours(additionalHoursRequestDTO.requestedHours());
        additionalHoursRequest.setJustification(additionalHoursRequestDTO.justification());
        additionalHoursRequest.setStatus(AdditionalHoursRequestStatus.PENDING_ADMIN_REVIEW);

        HoursApprovalHistory approvalHistory = new HoursApprovalHistory();

        approvalHistory.setRequestId(additionalHoursRequest.getRequesterId());
        approvalHistory.setCompanyId(currentUser.getCompany().getCompanyId());
        approvalHistory.setActionDate(LocalDateTime.now());
        approvalHistory.setComments(additionalHoursRequestDTO.comments());
        approvalHistory.setAction(ApprovalAction.REQUESTED);

        hoursApprovalHistoryRepository.save(approvalHistory);
        AdditionalHoursRequest created = additionalHoursRequestRepository.save(additionalHoursRequest);

        return AdditionalHoursResponseDTO.from(created, currentUser.getUsername());
    }

//    @Transactional
//    public void managerReviewRequest(AdditionalHoursRequestDTO additionalHoursRequestDTO){
//        AdditionalHoursRequest additionalHoursRequest = additionalHoursRequestService.findById(additionalHoursRequestDTO.requesterId());
//
//        companyMembershipValidator.validateManagerCompany(userValidator.getAuthenticatedUser().getUserId(),
//                userValidator.getAuthenticatedUser().getCompany().getCompanyId());
//
//        if (additionalHoursRequestDTO.isApproved()) {
//            additionalHoursRequest.setStatus(AdditionalHoursRequestStatus.PENDING_ADMIN_REVIEW);
//        }
//        else {
//            additionalHoursRequest.setStatus(AdditionalHoursRequestStatus.REJECTED);
//        }
//
//        HoursApprovalHistory approvalHistory = new HoursApprovalHistory();
//
//        approvalHistory.setRequestId(additionalHoursRequestDTO.requesterId());
//        approvalHistory.setApprovedBy(userValidator.getAuthenticatedUser().getUserId());
//        approvalHistory.setCompanyId(userValidator.getAuthenticatedUser().getCompany().getCompanyId());
//        approvalHistory.setActionDate(LocalDateTime.now());
//        approvalHistory.setComments(additionalHoursRequestDTO.comments());
//
//        if (additionalHoursRequestDTO.isApproved()) {
//            approvalHistory.setAction(ApprovalAction.MANAGER_APPROVE);
//        } else {
//            approvalHistory.setAction(ApprovalAction.MANAGER_REJECT);
//        }
//        approvalHistory.setComments(additionalHoursRequestDTO.justification());
//
//        hoursApprovalHistoryRepository.save(approvalHistory);
//    }

    @Transactional
    public void managerReviewRequest(AdditionalHoursRequestDTO additionalHoursRequestDTO){
        AdditionalHoursRequest additionalHoursRequest = additionalHoursRequestService
                .findById(additionalHoursRequestDTO.additionalHoursRequestId());

        companyMembershipValidator.validateManagerCompany(userValidator.getAuthenticatedUser().getUserId(),
                userValidator.getAuthenticatedUser().getCompany().getCompanyId());

        User recipient = userRepository.findById(additionalHoursRequest.getRequesterId())
                .orElseThrow(() -> new NotFoundException("Requester user not found"));

        HoursApprovalHistory approvalHistory = new HoursApprovalHistory();
        approvalHistory.setRequestId(additionalHoursRequestDTO.requesterId());
        approvalHistory.setApprovedBy(userValidator.getAuthenticatedUser().getUserId());
        approvalHistory.setCompanyId(userValidator.getAuthenticatedUser().getCompany().getCompanyId());
        approvalHistory.setActionDate(LocalDateTime.now());
        approvalHistory.setComments(additionalHoursRequestDTO.comments());

        if (additionalHoursRequestDTO.isApproved()) {
            additionalHoursRequest.setStatus(AdditionalHoursRequestStatus.PENDING_ADMIN_REVIEW);
            approvalHistory.setAction(ApprovalAction.MANAGER_APPROVE);

            sendNotification(
                    recipient,
                    "Aprovação do gerente",
                    "Seu pedido de horário foi aprovado pelo gerente e aguarda revisão do Admin.",
                    NotificationType.SUCCESS
            );

            notifyAllAdmins(
                    "Aprovação Pendente",
                    "Nova solicitação de horas aprovada pelo gestor. Aguardando revisão final.",
                    NotificationType.WARNING
            );

        } else {
            additionalHoursRequest.setStatus(AdditionalHoursRequestStatus.REJECTED);
            approvalHistory.setAction(ApprovalAction.MANAGER_REJECT);

            sendNotification(
                    recipient,
                    "Horário rejeitado pelo gerente",
                    "Sua solicitação foi rejeitada. Motivo: " + additionalHoursRequestDTO.comments(),
                    NotificationType.WARNING
            );
        }

        hoursApprovalHistoryRepository.save(approvalHistory);
        additionalHoursRequestRepository.save(additionalHoursRequest);
    }

    private void notifyAllAdmins(String title, String message, NotificationType type) {
        List<User> admins = userRepository.findByRole(UserRole.ADMIN);

        for (User admin : admins) {
            Notification notification = new Notification();
            notification.setRecipient(admin);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setType(type);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            notificationRepository.save(notification);
        }
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
}

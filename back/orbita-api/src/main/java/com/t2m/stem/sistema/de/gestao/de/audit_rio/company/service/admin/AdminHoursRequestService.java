package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.AdditionalHoursRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.HoursApprovalHistory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.ReviewRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.ReviewRequestResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.ApprovalAction;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.AdditionalHoursRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.HoursApprovalHistoryRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.AdditionalHoursRequestService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.CompanyHoursQuotaService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.MonthlyUsageCompanyHoursService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.validator.CompanyMembershipValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.Notification;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.enums.NotificationType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.repository.NotificationRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
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
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class AdminHoursRequestService {
    private CompanyMembershipValidator companyMembershipValidator;
    private HoursApprovalHistoryRepository hoursApprovalHistoryRepository;
    private UserValidator userValidator;
    private CompanyHoursQuotaService companyHoursQuotaService;
    private AdditionalHoursRequestService additionalHoursRequestService;
    private AdditionalHoursRequestRepository additionalHoursRequestRepository;
    private MonthlyUsageCompanyHoursService monthlyUsageCompanyHoursService;
    private AdminCompanyService adminCompanyService;
    private NotificationRepository notificationRepository;
    private UserRepository userRepository;

    public Page<AdditionalHoursResponseDTO> getAllAdditionalHoursRequest(Pageable pageable) {
        userValidator.validateAdminAccess();

        return additionalHoursRequestRepository.findAll(pageable)
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                });
    }

    public List<AdditionalHoursResponseDTO> getAdditionalRequestByStatus(AdditionalHoursRequestStatus status){
        userValidator.validateAdminAccess();

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository.findByStatus(status);

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
        userValidator.validateAdminAccess();

        return additionalHoursRequestRepository.findById(additionalHoursRequestId)
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                })
                .orElseThrow(() -> new NotFoundException("Additional Hours Request not found"));
    }

    public List<AdditionalHoursResponseDTO> getAllAdditionalHoursRequestsByUserId(UUID userId) {
        userValidator.validateAdminAccess();

        String requesterName = userRepository.findById(userId)
                .map(User::getUsername)
                .orElse("Usuário Desconhecido");

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository.findByRequesterId(userId);

        return additionalHoursRequests.stream()
                .map(request -> AdditionalHoursResponseDTO.from(request, requesterName))
                .toList();
    }

    public List<AdditionalHoursResponseDTO> getAllAdditionalHoursRequestsByCompanyId(UUID companyId) {
        userValidator.validateAdminAccess();

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository.findByCompanyId(companyId);

        return additionalHoursRequests.stream()
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                })
                .toList();
    }

    public List<AdditionalHoursResponseDTO> getReviewRequest(){
        userValidator.validateAdminAccess();

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository
                .findByStatus(AdditionalHoursRequestStatus.PENDING_ADMIN_REVIEW);

        return additionalHoursRequests.stream()
                .map(request -> {
                    String requesterName = userRepository.findById(request.getRequesterId())
                            .map(User::getUsername)
                            .orElse("Usuário Desconhecido");

                    return AdditionalHoursResponseDTO.from(request, requesterName);
                })
                .toList();
    }

    @Transactional
    public void adminReviewRequest(AdditionalHoursRequestDTO additionalHoursRequestDTO){
        User adminUser = userValidator.getAuthenticatedUser();
        companyMembershipValidator.validateAdmin(adminUser.getUserId());

        AdditionalHoursRequest additionalHoursRequest = additionalHoursRequestService
                .findById(additionalHoursRequestDTO.requesterId());

        if (additionalHoursRequestDTO.isApproved()) {
            approveAdditionalHoursRequest(additionalHoursRequest);
        } else {
            rejectAdditionalHoursRequest(additionalHoursRequest);
        }

        createApprovalHistory(additionalHoursRequest, adminUser, additionalHoursRequestDTO);
    }

    @Transactional
    public void reviewRequest(ReviewRequestDTO reviewDTO){
        User adminUser = userValidator.getAuthenticatedUser();
        companyMembershipValidator.validateAdmin(adminUser.getUserId());

        if (reviewDTO.additionalHoursRequestId() == null) {
            throw new IllegalArgumentException("The request ID is required.");
        }

        AdditionalHoursRequest additionalHoursRequest = additionalHoursRequestService
                .findById(reviewDTO.additionalHoursRequestId());

        if (Boolean.TRUE.equals(reviewDTO.isApproved())) {
            approveAdditionalHoursRequest(additionalHoursRequest);
        } else {
            rejectAdditionalHoursRequest(additionalHoursRequest, reviewDTO.comments());
        }

        createApprovalHistory(additionalHoursRequest, adminUser, reviewDTO);
    }

    public List<ReviewRequestResponseDTO> getReviewRequestWithCompany() {
        var requests = additionalHoursRequestRepository.findByStatus(AdditionalHoursRequestStatus.PENDING_ADMIN_REVIEW);

        return requests.stream().map(request -> {
            String companyName;
            try {
                var company = adminCompanyService.getCompanyById(request.getCompanyId());
                companyName = company.name();
            } catch (Exception e) {
                companyName = "Empresa Desconhecida";
            }
            return ReviewRequestResponseDTO.from(request, companyName);
        }).collect(Collectors.toList());
    }

//    private void approveAdditionalHoursRequest(AdditionalHoursRequest request) {
//        companyHoursQuotaService.addAdditionalHours(
//                request.getCompanyId(),
//                request.getRequestedHours()
//        );
//        request.setStatus(AdditionalHoursRequestStatus.APPROVED);
//        request.setApproved(true);
//    }

    private void approveAdditionalHoursRequest(AdditionalHoursRequest request) {
        companyHoursQuotaService.addAdditionalHours(
                request.getCompanyId(),
                request.getRequestedHours()
        );
        request.setStatus(AdditionalHoursRequestStatus.APPROVED);
        request.setApproved(true);

        User recipient = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new NotFoundException("Requester user not found for notification"));

        sendNotification(
                recipient,
                "Horas Adicionais Aprovadas",
                "Sua solicitação de " + request.getRequestedHours() + " horas adicionais foi aprovada.",
                NotificationType.SUCCESS
        );
    }

    private void rejectAdditionalHoursRequest(AdditionalHoursRequest request, String reason) {
        request.setStatus(AdditionalHoursRequestStatus.REJECTED);

        User recipient = userRepository.findById(request.getRequesterId())
                .orElseThrow(() -> new NotFoundException("Requester user not found for notification"));

        String message = "Sua solicitação de " + request.getRequestedHours() + " horas adicionais foi recusada.";
        if (reason != null && !reason.isBlank()) {
            message += " Motivo: " + reason;
        }

        sendNotification(
                recipient,
                "Horas Adicionais Recusadas",
                message,
                NotificationType.WARNING
        );
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

    private void rejectAdditionalHoursRequest(AdditionalHoursRequest request) {
        request.setStatus(AdditionalHoursRequestStatus.REJECTED);
    }

    private void createApprovalHistory(AdditionalHoursRequest request, User adminUser,
                                       AdditionalHoursRequestDTO dto) {
        HoursApprovalHistory approvalHistory = new HoursApprovalHistory();
        approvalHistory.setRequestId(request.getRequesterId());
        approvalHistory.setApprovedBy(adminUser.getUserId());
        approvalHistory.setActionDate(LocalDateTime.now());
        approvalHistory.setComments(dto.comments());

        if (dto.isApproved()) {
            approvalHistory.setAction(ApprovalAction.ADMIN_APPROVE);
        } else {
            approvalHistory.setAction(ApprovalAction.ADMIN_REJECT);
        }

        hoursApprovalHistoryRepository.save(approvalHistory);
    }

    private void createApprovalHistory(AdditionalHoursRequest request, User adminUser,
                                       ReviewRequestDTO dto) {
        HoursApprovalHistory approvalHistory = new HoursApprovalHistory();

        approvalHistory.setRequestId(request.getAdditionalHoursRequestId());

        approvalHistory.setApprovedBy(adminUser.getUserId());
        approvalHistory.setActionDate(LocalDateTime.now());
        approvalHistory.setComments(dto.comments());

        if (dto.status() == AdditionalHoursRequestStatus.APPROVED) {
            approvalHistory.setAction(ApprovalAction.ADMIN_APPROVE);
        } else {
            approvalHistory.setAction(ApprovalAction.ADMIN_REJECT);
        }

        hoursApprovalHistoryRepository.save(approvalHistory);
    }
}
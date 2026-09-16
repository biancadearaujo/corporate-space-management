package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.AdditionalHoursRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.HoursApprovalHistory;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.ApprovalAction;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.AdditionalHoursRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.HoursApprovalHistoryRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.validator.CompanyMembershipValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
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
public class CollaboratorHoursRequestService {
    private CompanyMembershipValidator companyMembershipValidator;
    private AdditionalHoursRequestRepository additionalHoursRequestRepository;
    private HoursApprovalHistoryRepository hoursApprovalHistoryRepository;
    private UserValidator userValidator;

    public Page<AdditionalHoursResponseDTO> getAllAdditionalHoursRequest(Pageable pageable) {
        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        userValidator.validateCollaborator(currentUser.getUserId());

        return additionalHoursRequestRepository.findByRequesterIdAndCompanyId(currentUser.getUserId(), pageable, companyId)
                .map(req -> AdditionalHoursResponseDTO.from(req, currentUser.getUsername()));
    }

    public List<AdditionalHoursResponseDTO> getAdditionalRequestByStatus(AdditionalHoursRequestStatus status){
        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        userValidator.validateCollaborator(currentUser.getUserId());

        List<AdditionalHoursRequest> additionalHoursRequests = additionalHoursRequestRepository
                .findByStatusAndRequesterIdAndCompanyId(status, currentUser.getUserId(), companyId);

        return additionalHoursRequests.stream()
                .map(req -> AdditionalHoursResponseDTO.from(req, currentUser.getUsername()))
                .toList();
    }

    public AdditionalHoursResponseDTO getAdditionalHoursRequestById(UUID additionalHoursRequestId) {
        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        userValidator.validateCollaborator(currentUser.getUserId());

        return additionalHoursRequestRepository
                .findByAdditionalHoursRequestIdAndRequesterIdAndCompanyId(additionalHoursRequestId,
                        currentUser.getUserId(), companyId)
                .map(req -> AdditionalHoursResponseDTO.from(req, currentUser.getUsername()))
                .orElseThrow(() -> new NotFoundException("Additional Hours Request not found"));
    }

    @Transactional
    public AdditionalHoursResponseDTO collaboratorRequest(AdditionalHoursRequestDTO additionalHoursRequestDTO) {
        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        companyMembershipValidator.validateCollaboratorCompany(currentUser.getUserId(), companyId);

        AdditionalHoursRequest additionalHoursRequest = new AdditionalHoursRequest();

        additionalHoursRequest.setCompanyId(companyId);
        additionalHoursRequest.setRequesterId(currentUser.getUserId());
        additionalHoursRequest.setRequestedHours(additionalHoursRequestDTO.requestedHours());
        additionalHoursRequest.setJustification(additionalHoursRequestDTO.justification());
        additionalHoursRequest.setStatus(AdditionalHoursRequestStatus.PENDING_MANAGER_REVIEW);
        additionalHoursRequest.setCreatedAt(LocalDateTime.now());

        HoursApprovalHistory approvalHistory = new HoursApprovalHistory();

        approvalHistory.setRequestId(additionalHoursRequest.getRequesterId());
        approvalHistory.setCompanyId(companyId);
        approvalHistory.setActionDate(LocalDateTime.now());
        approvalHistory.setComments(additionalHoursRequestDTO.comments());
        approvalHistory.setAction(ApprovalAction.REQUESTED);

        hoursApprovalHistoryRepository.save(approvalHistory);
        AdditionalHoursRequest created = additionalHoursRequestRepository.save(additionalHoursRequest);

        return AdditionalHoursResponseDTO.from(created, currentUser.getUsername());
    }
}

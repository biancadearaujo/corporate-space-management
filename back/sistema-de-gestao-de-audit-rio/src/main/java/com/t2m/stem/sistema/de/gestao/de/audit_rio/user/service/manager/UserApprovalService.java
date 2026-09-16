package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRejectedResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRejectedRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRejectedRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRejectedRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserApprovalService {
    private UserRegistrationRequestRepository userRegistrationRequestRepository;
    private UserRepository userRepository;
    private UserRejectedRequestRepository userRejectedRequestRepository;
    private UserValidator userValidator;

    //TODO: Testar.
    //TODO: Melhorar método.
    @Transactional
    public UserResponseDTO approveUser(UUID id) {
        User currentUsername = userValidator.getAuthenticatedUser();

        UserRegistrationRequest userRegistrationRequest = userValidator.validateUser(id, userRegistrationRequestRepository);

        if (!currentUsername.getRole().equals(UserRole.MANAGER)) {
            throw new IllegalArgumentException("Only managers can approve requests.");
        }
        if (!userRegistrationRequest.getCompany().getCompanyId().equals(currentUsername.getCompany().getCompanyId())) {
            throw new IllegalArgumentException("Only managers from the same company can approve requests.");
        }

        User user = new User();
        userValidator.validateCpf(user, userRepository);

        user.setUsername(userRegistrationRequest.getUsername());
        user.setEmail(userRegistrationRequest.getEmail());
        user.setPassword(userRegistrationRequest.getPassword());
        user.setCpf(userRegistrationRequest.getCpf());
        user.setCompany(userRegistrationRequest.getCompany());
        user.setRole(UserRole.COLLABORATOR);
        user.setPhotoUrl(userRegistrationRequest.getPhotoUrl());
        user.setPhoneNumber(userRegistrationRequest.getPhoneNumber());
        user.setRgNumber(userRegistrationRequest.getRgNumber());

        userRegistrationRequest.setStatus(RequestStatus.APPROVED);
        userRegistrationRequest.setManagerId(currentUsername.getUserId());
        userRegistrationRequest.setDecidedAt(LocalDateTime.now());

        User created = userRepository.save(user);
        userRegistrationRequestRepository.save(userRegistrationRequest);

        return UserResponseDTO.from(created);
    }

    //TODO: Testar.
    @Transactional
    public UserRejectedResponseDTO rejectUser(UUID id, UserRejectedRequestDTO userRejectedRequestDTO) {
        User currentUsername = userValidator.getAuthenticatedUser();

        UserRegistrationRequest userRegistrationRequest = userValidator.validateUser(id, userRegistrationRequestRepository);

        if (!currentUsername.getRole().equals(UserRole.MANAGER)) {
            throw new IllegalArgumentException("Only managers can approve requests.");
        }
        if (!userRegistrationRequest.getCompany().getCompanyId().equals(currentUsername.getCompany().getCompanyId())) {
            throw new IllegalArgumentException("Only managers from the same company can approve requests.");
        }

        UserRejectedRequest userRejectedRequest = new UserRejectedRequest();

        userRejectedRequest.setUsername(userRegistrationRequest.getUsername());
        userRejectedRequest.setEmail(userRegistrationRequest.getEmail());
        userRejectedRequest.setPassword(userRegistrationRequest.getPassword());
        userRejectedRequest.setCpf(userRegistrationRequest.getCpf());
        userRejectedRequest.setCompany(userRegistrationRequest.getCompany());
        userRejectedRequest.setStatus(RequestStatus.REJECTED);
        userRejectedRequest.setManagerId(userValidator.getAuthenticatedUser().getUserId());
        userRejectedRequest.setDecidedAt(LocalDateTime.now());
        userRejectedRequest.setRejectionReason(userRejectedRequestDTO.rejectionReason());
        userRejectedRequest.setPhotoUrl(userRegistrationRequest.getPhotoUrl());
        userRejectedRequest.setPhoneNumber(userRegistrationRequest.getPhoneNumber());
        userRejectedRequest.setRgNumber(userRegistrationRequest.getRgNumber());

        userRegistrationRequest.setStatus(RequestStatus.REJECTED);
        userRegistrationRequest.setDecidedAt(LocalDateTime.now());
        userRegistrationRequest.setManagerId(userValidator.getAuthenticatedUser().getUserId());
        userRegistrationRequest.setRejectionReason(userRejectedRequestDTO.rejectionReason());

        userRegistrationRequestRepository.save(userRegistrationRequest);
        UserRejectedRequest rejected = userRejectedRequestRepository.save(userRejectedRequest);

        return UserRejectedResponseDTO.from(rejected);
    }
}

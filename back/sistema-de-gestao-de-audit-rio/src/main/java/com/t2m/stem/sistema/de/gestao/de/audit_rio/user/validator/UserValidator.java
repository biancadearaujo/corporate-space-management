package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import lombok.AllArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class UserValidator {
    private UserRepository userRepository;

    public User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new NotFoundException("Logged in user not found"));
    }

    public void validateCpf(User user, UserRepository userRepo) {
        if (userRepo.existsByCpfAndCompany(user.getCpf(), user.getCompany())) {
            throw new IllegalArgumentException("CPF already registered with this company");
        }
    }

    public void validateCpfByCompanyId(UserRequestDTO userRequestDTO, UserRepository userRepo) {
        if (userRepo.existsByCpfAndCompanyCompanyId(userRequestDTO.cpf(), userRequestDTO.companyId())) {
            throw new IllegalArgumentException("CPF already registered with this company");
        }
    }

    public void validateRequestCpfByCompanyId(UserRegistrationRequestDTO userRegistrationRequestDTO, UserRepository userRepo) {
        if (userRepo.existsByCpfAndCompanyCompanyId(userRegistrationRequestDTO.cpf(), userRegistrationRequestDTO.companyId())) {
            throw new IllegalArgumentException("CPF already registered with this company");
        }
    }

    public UserRegistrationRequest validateUser(UUID id, UserRegistrationRequestRepository requestRepo) {
        UserRegistrationRequest request = requestRepo.findById(id)
                .orElseThrow(() -> new NotFoundException("User registration request not found."));

        if (request.getStatus() != RequestStatus.PENDING) {
            throw new IllegalArgumentException("Error approving");
        }
        return request;
    }

    public void validateAdminAccess() {
        User user = getAuthenticatedUser();
        if (!user.isAdmin()) {
            throw new IllegalArgumentException("Only admin can perform this action.");
        }
    }

    public void validateManagerAccess() {
        User user = getAuthenticatedUser();
        if (!user.isManager()) {
            throw new IllegalArgumentException("Only managers can perform this action.");
        }
    }

    public void validateCollaborator(UUID userId) {
        User currentUser = getAuthenticatedUser();

        if (!currentUser.getUserId().equals(userId)) {
            throw new IllegalArgumentException("Only the employee himself can perform this action.");
        }
        if (!currentUser.isCollaborator()) {
            throw new IllegalArgumentException("Only collaborator can perform this action.");
        }
    }
}

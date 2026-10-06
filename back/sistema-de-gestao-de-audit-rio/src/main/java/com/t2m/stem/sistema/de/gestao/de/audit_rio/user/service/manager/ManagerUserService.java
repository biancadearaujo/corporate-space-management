package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.PasswordChangeDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerUserService {
    private UserValidator userValidator;
    private UserRepository userRepository;
    private UserRegistrationRequestRepository userRegistrationRequestRepository;
    private PasswordEncoder passwordEncoder;

    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return userRepository.findByCompanyCompanyId(companyId, pageable)
                .map(UserResponseDTO::from);
    }

    public Page<UserRegistrationResponseDTO> getAllRequestUsers(Pageable pageable) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return userRegistrationRequestRepository.findByCompanyCompanyId(companyId, pageable)
                .map(UserRegistrationResponseDTO::from);
    }

    public List<UserRegistrationResponseDTO> getUsersByStatusPending(){
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<UserRegistrationRequest> userRegistrationRequests = userRegistrationRequestRepository
                .findByStatusAndCompanyCompanyId(RequestStatus.PENDING, companyId);

        return userRegistrationRequests.stream()
                .map(UserRegistrationResponseDTO::from)
                .toList();
    }

    public List<UserResponseDTO> getUsersByUsername(String username) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<User> users = userRepository.findByUsernameAndCompanyCompanyId(username, companyId);

        return users.stream()
                .map(UserResponseDTO::from)
                .toList();
    }

    public List<UserRegistrationResponseDTO> getUsersByStatus(RequestStatus status){
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        List<UserRegistrationRequest> userRegistrationRequests = userRegistrationRequestRepository
                .findByStatusAndCompanyCompanyId(status, companyId);

        return userRegistrationRequests.stream()
                .map(UserRegistrationResponseDTO::from)
                .toList();
    }

    public UserResponseDTO getUserById(UUID userId) {
        userValidator.validateManagerAccess();

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        if( !userRepository.existsByUserIdAndCompanyCompanyId(userId, companyId)) {
            throw new NotFoundException("User not found.");
        }

        return userRepository.findByUserIdAndCompanyCompanyId(userId, companyId)
                .map(UserResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    public UserResponseDTO updateProfile(UUID userId, UserUpdateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setUsername(dto.name());
        user.setPhoneNumber(dto.phoneNumber());
        user.setPhotoUrl(dto.image());

        userRepository.save(user);

        return UserResponseDTO.from(user);
    }

    public void changePassword(UUID userId, PasswordChangeDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        if (!passwordEncoder.matches(dto.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("The current password is incorrect.");
        }

        if (passwordEncoder.matches(dto.newPassword(), user.getPassword())) {
            throw new IllegalArgumentException("The new password cannot be the same as the current one.");
        }

        user.setPassword(passwordEncoder.encode(dto.newPassword()));
        userRepository.save(user);
    }
}
package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.PasswordChangeDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class CollaboratorUserService {
    private UserValidator userValidator;
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;

    public UserResponseDTO getUserById(UUID userId) {
        userValidator.validateCollaborator(userId);

        User currentUser = userValidator.getAuthenticatedUser();
        UUID companyId = currentUser.getCompany().getCompanyId();

        return userRepository.findByUserIdAndCompanyCompanyId(userId, companyId)
                .map(UserResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    public UserResponseDTO updateProfile(UUID userId, UserUpdateDTO dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        user.setUsername(dto.name());
        user.setPhoneNumber(dto.phoneNumber());

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
package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.AssignManagerDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminRoleService {
    private UserRepository userRepository;
    private CompanyRepository companyRepository;
    private UserValidator userValidator;
    private UserRegistrationRequestRepository userRegistrationRequestRepository;

    @Transactional
    public UserResponseDTO promoteToManager(UUID id) {
        User user = userRepository.findById(id).orElseThrow(() ->
                new NotFoundException("User not found: " + id));

        if (user.getRole() == UserRole.MANAGER) {
            throw new IllegalArgumentException("User is already a manager");
        }

        user.setRole(UserRole.MANAGER);
        User promoted = userRepository.save(user);

        return UserResponseDTO.from(promoted);
    }

    @Transactional
    public UserResponseDTO assignManagerToCompany(AssignManagerDTO dto) {
        userValidator.validateAdminAccess();

        Company targetCompany = companyRepository.findById(dto.targetCompanyId())
                .orElseThrow(() -> new NotFoundException("Empresa alvo não encontrada."));

        Optional<User> existingUser = userRepository.findByEmail(dto.email());

        if (existingUser.isPresent()) {
            User user = existingUser.get();

            user.setCompany(targetCompany);
            user.setRole(UserRole.MANAGER);

            userRepository.save(user);
            return UserResponseDTO.from(user);
        }

        Optional<UserRegistrationRequest> pendingRequest = userRegistrationRequestRepository.findByEmail(dto.email());

        if (pendingRequest.isPresent()) {
            UserRegistrationRequest request = pendingRequest.get();

            User newUser = new User();
            newUser.setUsername(request.getUsername());
            newUser.setEmail(request.getEmail());
            newUser.setPassword(request.getPassword());
            newUser.setCpf(request.getCpf());
            newUser.setRgNumber(request.getRgNumber());
            newUser.setPhoneNumber(request.getPhoneNumber());
            newUser.setPhotoUrl(request.getPhotoUrl());

            newUser.setCompany(targetCompany);
            newUser.setRole(UserRole.MANAGER);

            request.setStatus(RequestStatus.APPROVED);
            request.setDecidedAt(LocalDateTime.now());

            userRegistrationRequestRepository.save(request);
            userRepository.save(newUser);

            return UserResponseDTO.from(newUser);
        }

        throw new NotFoundException("Nenhum usuário ou solicitação encontrada com o email: " + dto.email());
    }
}

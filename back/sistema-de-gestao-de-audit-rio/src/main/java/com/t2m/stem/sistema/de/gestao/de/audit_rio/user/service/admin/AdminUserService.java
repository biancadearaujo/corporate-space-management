package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.ExceptionHandlerController;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.*;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.apache.coyote.BadRequestException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminUserService {
    private UserRepository userRepository;
    private PasswordEncoder passwordEncoder;
    private CompanyRepository companyRepository;
    private UserValidator userValidator;
    private UserRegistrationRequestRepository userRegistrationRequestRepository;

    public Page<UserResponseDTO> getAllUsers(Pageable pageable) {
        userValidator.validateAdminAccess();

        return userRepository.findAll(pageable)
                .map(UserResponseDTO::from);
    }

    public Page<UserRegistrationResponseDTO> getAllRequestUsers(Pageable pageable) {
        userValidator.validateAdminAccess();

        return userRegistrationRequestRepository.findAll(pageable)
                .map(UserRegistrationResponseDTO::from);
    }

    public List<UserResponseDTO> getAllManagers() {
        userValidator.validateAdminAccess();

        List<User> managers = userRepository.findByRole(UserRole.MANAGER);

        return managers.stream()
                .map(UserResponseDTO::from)
                .toList();
    }

    public UserResponseDTO getUserById(UUID userId) {
        userValidator.validateAdminAccess();

        return userRepository.findById(userId)
                .map(UserResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("User not found."));
    }

    public List<UserResponseDTO> getUserByUsername(String username) {
        userValidator.validateAdminAccess();

        return Collections.singletonList(userRepository.findByUsername(username)
                .map(UserResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("User not found.")));
    }

    public List<UserRegistrationResponseDTO> getUsersByStatus(RequestStatus status){
        userValidator.validateAdminAccess();

        List<UserRegistrationRequest> userRegistrationRequests = userRegistrationRequestRepository.findByStatus(status);

        return userRegistrationRequests.stream()
                .map(UserRegistrationResponseDTO::from)
                .toList();
    }

    @Transactional
    public UserResponseDTO adminCreateUser(UserRequestDTO requestDTO){
        userValidator.validateAdminAccess();

        String encryptedPassword = passwordEncoder.encode(requestDTO.password());

        Company company = companyRepository.findById(requestDTO.companyId())
                .orElseThrow(() -> new NotFoundException("Company not found."));

        userValidator.validateCpfByCompanyId(requestDTO, userRepository);

        User user = createUser(requestDTO, encryptedPassword, company);
        createUserRegistrationRequest(requestDTO, encryptedPassword, company);

        User created = userRepository.save(user);

        return UserResponseDTO.from(created);
    }

    private User createUser(UserRequestDTO userRequestDTO, String encryptedPassword, Company company) {
        User user = new User();

        user.setUsername(userRequestDTO.username());
        user.setEmail(userRequestDTO.email());
        user.setPassword(encryptedPassword);
        user.setCpf(userRequestDTO.cpf());
        user.setCompany(company);
        user.setPhotoUrl(userRequestDTO.photoUrl());
        user.setPhoneNumber(userRequestDTO.phoneNumber());
        user.setRgNumber(userRequestDTO.rgNumber());
        user.setRole(UserRole.MANAGER);

        return user;
    }

    @Transactional
    public UserResponseDTO changeUserRole(UUID userId, RoleUpdateDTO dto) {
        userValidator.validateAdminAccess();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("Usuário não encontrado"));

        try {
            UserRole newRole = UserRole.valueOf(dto.role().toUpperCase());
            user.setRole(newRole);
        } catch (IllegalArgumentException e) {
            throw new NotFoundException("Cargo inválido. Use: MANAGER, COLLABORATOR ou ADMIN.");
        }

        User updated = userRepository.save(user);
        return UserResponseDTO.from(updated);
    }

    private void createUserRegistrationRequest(UserRequestDTO userRequestDTO,
                                               String encryptedPassword, Company company) {
        UserRegistrationRequest userRegistrationRequest = new UserRegistrationRequest();

        userRegistrationRequest.setUsername(userRequestDTO.username());
        userRegistrationRequest.setEmail(userRequestDTO.email());
        userRegistrationRequest.setPassword(encryptedPassword);
        userRegistrationRequest.setCpf(userRequestDTO.cpf());
        userRegistrationRequest.setCompany(company);
        userRegistrationRequest.setStatus(RequestStatus.APPROVED);
        userRegistrationRequest.setPhotoUrl(userRequestDTO.photoUrl());
        userRegistrationRequest.setPhoneNumber(userRequestDTO.phoneNumber());
        userRegistrationRequest.setRgNumber(userRequestDTO.rgNumber());

        userRegistrationRequestRepository.save(userRegistrationRequest);
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

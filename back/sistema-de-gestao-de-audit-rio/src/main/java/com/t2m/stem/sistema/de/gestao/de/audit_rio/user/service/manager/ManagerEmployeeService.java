package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.ManagerCreateUserDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.AssignEmployeeToCompanyDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ManagerEmployeeService {
    private UserRepository userRepository;
    private UserRegistrationRequestRepository userRegistrationRequestRepository;
    private CompanyRepository companyRepository;
    private UserValidator userValidator;

    public UserResponseDTO assignEmployeeToCompany(UUID id, AssignEmployeeToCompanyDTO assignEmployeeToCompanyDTO) {
        UserRegistrationRequest userRegistrationRequest = userRegistrationRequestRepository.findById(id).orElseThrow(() ->
                new NotFoundException("User registration request not found."));

        User user = new User();

        User currentUser = userValidator.getAuthenticatedUser();
        userValidator.validateCpf(user, userRepository);

        user.setUsername(userRegistrationRequest.getUsername());
        user.setEmail(assignEmployeeToCompanyDTO.email());
        user.setPassword(userRegistrationRequest.getPassword());
        user.setCpf(userRegistrationRequest.getCpf());
        user.setCompany(currentUser.getCompany());
        userRegistrationRequest.setStatus(RequestStatus.APPROVED);
        user.setRole(UserRole.COLLABORATOR);
        user.setPhotoUrl(userRegistrationRequest.getPhotoUrl());
        user.setPhoneNumber(userRegistrationRequest.getPhoneNumber());
        user.setRgNumber(userRegistrationRequest.getRgNumber());

        userRegistrationRequest.setManagerId(currentUser.getUserId());
        userRegistrationRequest.setDecidedAt(LocalDateTime.now());

        User created = userRepository.save(user);
        userRegistrationRequestRepository.save(userRegistrationRequest);

        return UserResponseDTO.from(created);
    }

    @Transactional
    public void removeEmployee(UUID userId) {
        var user = userRepository.findById(userId).orElseThrow(() ->
                new NotFoundException("User not found"));

        var company = companyRepository.findById(user.getCompany().getCompanyId()).orElseThrow(() ->
                new NotFoundException("Company not found"));

        if (!user.getCompany().getCompanyId().equals(company.getCompanyId())) {
            throw new IllegalArgumentException("User does not belong to this company");
        }

        userRepository.deleteById(userId);
    }

    @Transactional
    public UserResponseDTO createEmployeeDirectly(ManagerCreateUserDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        if (!currentUser.getRole().equals(UserRole.MANAGER)) {
            throw new IllegalArgumentException("Apenas gerentes podem criar usuários.");
        }

        User user = new User();
        user.setUsername(dto.username());
        user.setEmail(dto.email());
        user.setPassword(dto.password());
        user.setCpf(dto.cpf());
        user.setRgNumber(dto.rgNumber());
        user.setPhoneNumber(dto.phoneNumber());
        user.setCompany(currentUser.getCompany());
        user.setRole(UserRole.COLLABORATOR);

        userValidator.validateCpf(user, userRepository);

        UserRegistrationRequest request = new UserRegistrationRequest();

        request.setUsername(dto.username());
        request.setEmail(dto.email());
        request.setPassword(dto.password());
        request.setCpf(dto.cpf());
        request.setRgNumber(dto.rgNumber());
        request.setPhoneNumber(dto.phoneNumber());
        request.setCompany(currentUser.getCompany());

        request.setStatus(RequestStatus.APPROVED);
        request.setManagerId(currentUser.getUserId());
        request.setDecidedAt(LocalDateTime.now());

        userRegistrationRequestRepository.save(request);
        User created = userRepository.save(user);

        return UserResponseDTO.from(created);
    }
}

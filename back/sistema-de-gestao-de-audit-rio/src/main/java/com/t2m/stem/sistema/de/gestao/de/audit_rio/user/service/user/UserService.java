package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.user;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.Company;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.NewCompanyAccessDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.repository.CompanyRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.UserRegistrationRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRegistrationRequestRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class UserService {
    private UserRepository userRepository;
    private UserRegistrationRequestRepository userRegistrationRequestRepository;
    private PasswordEncoder passwordEncoder;
    private CompanyRepository companyRepository;
    private UserValidator userValidator;

    public UserRegistrationResponseDTO userRegistrationRequest(UserRegistrationRequestDTO userRegistrationRequestDTO){
        String encryptedPassword = passwordEncoder.encode(userRegistrationRequestDTO.password());

        Company company = companyRepository.findById(userRegistrationRequestDTO.companyId())
                .orElseThrow(() -> new NotFoundException("Company not found."));

        userValidator.validateRequestCpfByCompanyId(userRegistrationRequestDTO, userRepository);

        UserRegistrationRequest userRegistrationRequest = createUserRegistrationRequest(userRegistrationRequestDTO,
                encryptedPassword, company);

        UserRegistrationRequest created =  userRegistrationRequestRepository.save(userRegistrationRequest);

        return UserRegistrationResponseDTO.from(created);
    }

    public void requestNewCompanyAccess(UUID currentUserId, NewCompanyAccessDTO dto) {
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("Logged-in user not found."));

        String cleanCnpj = dto.cnpj().replaceAll("\\D", "");

        Company targetCompany = companyRepository.findByCnpj(cleanCnpj)
                .orElseThrow(() -> new NotFoundException("Company not found with the provided CNPJ."));

        if (currentUser.getCompany() != null && currentUser.getCompany().getCompanyId().equals(targetCompany.getCompanyId())) {
            throw new IllegalArgumentException("You are already registered with this company.");
        }

        if (userRepository.findByEmail(dto.newEmail()).isPresent()) {
            throw new IllegalArgumentException("This email address is already in use in the system.");
        }

        UserRegistrationRequest request = new UserRegistrationRequest();

        request.setCompany(targetCompany);
        request.setEmail(dto.newEmail());
        request.setPassword(currentUser.getPassword());

        request.setUsername(currentUser.getUsername());
        request.setCpf(currentUser.getCpf());
        request.setRgNumber(currentUser.getRgNumber());
        request.setPhoneNumber(currentUser.getPhoneNumber());
        request.setPhotoUrl(currentUser.getPhotoUrl());

        request.setStatus(RequestStatus.PENDING);

        userRegistrationRequestRepository.save(request);
    }

    private UserRegistrationRequest createUserRegistrationRequest(UserRegistrationRequestDTO userRegistrationRequestDTO,
                                               String encryptedPassword, Company company){
        UserRegistrationRequest userRegistrationRequest = new UserRegistrationRequest();

        userRegistrationRequest.setUsername(userRegistrationRequestDTO.username());
        userRegistrationRequest.setEmail(userRegistrationRequestDTO.email());
        userRegistrationRequest.setPassword(encryptedPassword);
        userRegistrationRequest.setCpf(userRegistrationRequestDTO.cpf());
        userRegistrationRequest.setCompany(company);
        userRegistrationRequest.setStatus(RequestStatus.PENDING);
        userRegistrationRequest.setManagerId(userRegistrationRequestDTO.managerId());
        userRegistrationRequest.setPhotoUrl(userRegistrationRequestDTO.photoUrl());
        userRegistrationRequest.setPhoneNumber(userRegistrationRequestDTO.phoneNumber());
        userRegistrationRequest.setRgNumber(userRegistrationRequestDTO.rgNumber());

        return userRegistrationRequest;
    }
}

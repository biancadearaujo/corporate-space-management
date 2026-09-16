package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.UserRole;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.repository.UserRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class CompanyMembershipValidator {
    private UserRepository userRepository;

    public void validateManagerCompany(UUID managerId, UUID companyId){
        User manager = userRepository.findById(managerId).orElseThrow(() ->
                new NotFoundException("User not found"));

        if (!manager.getRole().equals(UserRole.MANAGER)) {
            throw new IllegalArgumentException("User is not a manager");
        }
        if (!manager.getCompany().getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("User does not belong to the company");
        }
    }

    public void validateAdmin(UUID adminId){
        User admin = userRepository.findById(adminId).orElseThrow(() ->
                new NotFoundException("User not found"));

        if (!admin.getRole().equals(UserRole.ADMIN)) {
            throw new IllegalArgumentException("User is not an admin");
        }
    }

    public void validateCollaboratorCompany(UUID collaboratorId, UUID companyId){
        User collaborator = userRepository.findById(collaboratorId).orElseThrow(() ->
                new NotFoundException("User not found"));

        if (!collaborator.getRole().equals(UserRole.COLLABORATOR)) {
            throw new IllegalArgumentException("User is not a collaborator");
        }
        if (!collaborator.getCompany().getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("User does not belong to the company");
        }
    }

    public void validateUserCompany(UUID collaboratorId, UUID companyId){
        User collaborator = userRepository.findById(collaboratorId).orElseThrow(() ->
                new NotFoundException("User not found"));

        if (!collaborator.getCompany().getCompanyId().equals(companyId)) {
            throw new IllegalArgumentException("User does not belong to the company");
        }
    }
}

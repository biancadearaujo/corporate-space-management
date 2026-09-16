package com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.validator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.Scheduling;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.scheduling.model.SchedulingRegisterRequest;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class SchedulingPermissionValidator {
    private UserValidator userValidator;

    public void ValidateAccessToSchedulingUpdates(SchedulingRegisterRequest schedulingRequest) {
        User currentUser = userValidator.getAuthenticatedUser();

        if (!schedulingRequest.getCompany().getCompanyId().equals(currentUser.getCompany().getCompanyId())) {
            throw new IllegalArgumentException("You don't belong to the same company as this scheduling.");
        }
        if (currentUser.isCollaborator()) {
            if (!schedulingRequest.getCreatedBy().equals(currentUser.getUserId())) {
                throw new IllegalArgumentException("Collaborator can only update their own scheduling.");
            }
        }
    }

    public void validateAccessToSchedulingDelete(Scheduling scheduling) {
        User currentUser = userValidator.getAuthenticatedUser();

        if (!currentUser.isCollaborator()) {
            throw new IllegalArgumentException("Only collaborators can perform this action.");
        }

        if (!scheduling.getCompany().getCompanyId().equals(currentUser.getCompany().getCompanyId())) {
            throw new IllegalArgumentException("You don't belong to the same company as this scheduling.");
        }

        UUID createdBy = scheduling.getRegisterRequest().getCreatedBy();
        if (!createdBy.equals(currentUser.getUserId())) {
            throw new IllegalArgumentException("Collaborators can only delete their own scheduling.");
        }
    }
}

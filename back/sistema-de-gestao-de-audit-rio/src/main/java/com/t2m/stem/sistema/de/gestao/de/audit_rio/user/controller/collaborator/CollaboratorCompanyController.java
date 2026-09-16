package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.collaborator.CollaboratorCompanyService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/collaborator")
@AllArgsConstructor
public class CollaboratorCompanyController {
    private CollaboratorCompanyService collaboratorCompanyService;
    private UserValidator userValidator;

    @PreAuthorize("hasRole('COLLABORATOR')")
    @DeleteMapping({"/{userId}"})
    public ResponseEntity<Void> exitCompany(@PathVariable UUID userId) {
        collaboratorCompanyService.exitCompany(userId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @DeleteMapping("/company/exit")
    public ResponseEntity<Void> exitCompany() {
        User user = userValidator.getAuthenticatedUser();

        collaboratorCompanyService.exitCompany(user.getUserId());

        return ResponseEntity.noContent().build();
    }
}

package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.NewCompanyAccessDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.PasswordChangeDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.collaborator.CollaboratorUserService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.user.UserService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/collaborator")
@AllArgsConstructor
public class CollaboratorUserController {
    private CollaboratorUserService collaboratorUserService;
    private UserValidator userValidator;
    private UserService userService;

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/user/{userId}"})
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID userId) {
        var user = collaboratorUserService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping("/user/me")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        User user = userValidator.getAuthenticatedUser();

        return ResponseEntity.ok(UserResponseDTO.from(user));
    }

    @PostMapping("/request-new-company")
    public ResponseEntity<Void> requestNewCompanyAccess(@RequestBody @Valid NewCompanyAccessDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        userService.requestNewCompanyAccess(currentUser.getUserId(), dto);

        return ResponseEntity.ok().build();
    }

    @PutMapping("/user/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@RequestBody @Valid UserUpdateDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        var updatedUser = collaboratorUserService.updateProfile(currentUser.getUserId(), dto);

        return ResponseEntity.ok(updatedUser);
    }

    @PutMapping("/user/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid PasswordChangeDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        collaboratorUserService.changePassword(currentUser.getUserId(), dto);

        return ResponseEntity.ok().build();
    }
}

package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.PasswordChangeDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRegistrationResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.manager.ManagerUserService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/manager")
@AllArgsConstructor
public class ManagerUserController {
    private ManagerUserService managerUserService;
    private UserValidator userValidator;

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping("/user/me")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        User user = userValidator.getAuthenticatedUser();

        return ResponseEntity.ok(UserResponseDTO.from(user));
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/users/{status}"})
    public ResponseEntity<List<UserRegistrationResponseDTO>> getUsersByStatus(@PathVariable RequestStatus status) {
        var users = managerUserService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/users/pending"})
    public ResponseEntity<List<UserRegistrationResponseDTO>> getUserByStatusPending() {
        var users = managerUserService.getUsersByStatusPending();
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/users"})
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @PageableDefault(
                    size = 20,
                    sort = {"username"},
                    direction = Sort.Direction.ASC) Pageable pageable
    ) {
        var users = managerUserService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/users/request"})
    public ResponseEntity<Page<UserRegistrationResponseDTO>> getAllRequestUsers(
            @PageableDefault(
                    size = 20,
                    sort = {"username"},
                    direction = Sort.Direction.ASC) Pageable pageable
    ) {
        var users = managerUserService.getAllRequestUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/user/{userId}"})
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID userId) {
        var user = managerUserService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/user/username/{username}"})
    public ResponseEntity<List<UserResponseDTO>> getUserByUsername(@PathVariable String username) {
        var user = managerUserService.getUsersByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/user/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@RequestBody @Valid UserUpdateDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        var updatedUser = managerUserService.updateProfile(currentUser.getUserId(), dto);

        return ResponseEntity.ok(updatedUser);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/user/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid PasswordChangeDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        managerUserService.changePassword(currentUser.getUserId(), dto);

        return ResponseEntity.ok().build();
    }
}
package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.*;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.enums.RequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.admin.AdminUserService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminUserController {
    private AdminUserService adminUserService;
    private UserValidator userValidator;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/user/me")
    public ResponseEntity<UserResponseDTO> getMyProfile() {
        User user = userValidator.getAuthenticatedUser();

        return ResponseEntity.ok(UserResponseDTO.from(user));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"/user"})
    public ResponseEntity<UserResponseDTO> adminCreateUser(@Valid @RequestBody UserRequestDTO userDTO) {
        var user = adminUserService.adminCreateUser(userDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/users"})
    public ResponseEntity<Page<UserResponseDTO>> getAllUsers(
            @PageableDefault(
                    size = 20,
                    sort = {"company.name"},
                    direction = Sort.Direction.ASC) Pageable pageable
    ) {
        var users = adminUserService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/users/request"})
    public ResponseEntity<Page<UserRegistrationResponseDTO>> getAllRequestUsers(
            @PageableDefault(
                    size = 20,
                    sort = {"username"},
                    direction = Sort.Direction.ASC) Pageable pageable
    ) {
        var users = adminUserService.getAllRequestUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/users/managers")
    public ResponseEntity<List<UserResponseDTO>> getAllManagers() {
        var managers = adminUserService.getAllManagers();
        return ResponseEntity.ok(managers);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/user/{userId}"})
    public ResponseEntity<UserResponseDTO> getUserById(@PathVariable UUID userId) {
        var user = adminUserService.getUserById(userId);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/user/username/{username}"})
    public ResponseEntity<List<UserResponseDTO>> getUserByUsername(@PathVariable String username) {
        var user = adminUserService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/users/{status}"})
    public ResponseEntity<List<UserRegistrationResponseDTO>> getUsersByStatus(@PathVariable RequestStatus status) {
        var users = adminUserService.getUsersByStatus(status);
        return ResponseEntity.ok(users);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<UserResponseDTO> changeUserRole(
            @PathVariable UUID userId,
            @RequestBody RoleUpdateDTO roleDto) {

        var user = adminUserService.changeUserRole(userId, roleDto);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/user/me")
    public ResponseEntity<UserResponseDTO> updateMyProfile(@RequestBody @Valid UserUpdateDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        var updatedUser = adminUserService.updateProfile(currentUser.getUserId(), dto);

        return ResponseEntity.ok(updatedUser);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/user/change-password")
    public ResponseEntity<Void> changePassword(@RequestBody @Valid PasswordChangeDTO dto) {
        User currentUser = userValidator.getAuthenticatedUser();

        adminUserService.changePassword(currentUser.getUserId(), dto);

        return ResponseEntity.ok().build();
    }
}

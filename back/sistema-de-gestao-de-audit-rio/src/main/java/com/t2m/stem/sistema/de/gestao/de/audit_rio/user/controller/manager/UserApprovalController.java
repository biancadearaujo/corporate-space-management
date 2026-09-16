package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRejectedResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.manager.UserApprovalService;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserRejectedRequestDTO;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/manager")
@AllArgsConstructor
public class UserApprovalController {
    private UserApprovalService userApprovalService;

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping({"/user/approve/{id}"})
    public ResponseEntity<UserResponseDTO> approveUser(@Valid @PathVariable UUID id) {
        var user = userApprovalService.approveUser(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping({"/user/reject/{id}"})
    public ResponseEntity<UserRejectedResponseDTO> rejectUser(@Valid @PathVariable UUID id,
                                                              @RequestBody UserRejectedRequestDTO userRejectedRequestDTO) {
        var user = userApprovalService.rejectUser(id, userRejectedRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}

package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.AssignManagerDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.admin.AdminRoleService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminRoleController {
    private AdminRoleService adminRoleService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"promote-to-manager/{managerId}"})
    public ResponseEntity<UserResponseDTO> promoteToManager(@PathVariable UUID managerId) {
        var manager = adminRoleService.promoteToManager(managerId);
        return ResponseEntity.ok(manager);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/assign-manager")
    public ResponseEntity<UserResponseDTO> assignManager(@RequestBody @Valid AssignManagerDTO dto) {
        var manager = adminRoleService.assignManagerToCompany(dto);
        return ResponseEntity.ok(manager);
    }
}

package com.t2m.stem.sistema.de.gestao.de.audit_rio.user.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.AssignEmployeeToCompanyDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.ManagerCreateUserDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.dto.UserResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.service.manager.ManagerEmployeeService;
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
public class ManagerEmployeeController {
    private ManagerEmployeeService managerEmployeeService;

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping({"/user/approve/approve/{id}"})//TODO: Melhor a url.
    public ResponseEntity<UserResponseDTO> assignEmployeeToCompany(@PathVariable UUID id,
                                                                   @RequestBody AssignEmployeeToCompanyDTO assignEmployeeToCompanyDTO) {
        var user = managerEmployeeService.assignEmployeeToCompany(id, assignEmployeeToCompanyDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @DeleteMapping({"/users/{userId}"})
    public ResponseEntity<Void> removeEmployee(@PathVariable UUID userId) {
        managerEmployeeService.removeEmployee(userId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping("/users")
    public ResponseEntity<UserResponseDTO> createEmployee(@RequestBody @Valid ManagerCreateUserDTO dto) {
        var user = managerEmployeeService.createEmployeeDirectly(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(user);
    }
}

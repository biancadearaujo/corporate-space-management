package com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.dto.AccessibilityRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.dto.AccessibilityResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.service.AccessibilityService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminAccessibilityController {
    private AccessibilityService accessibilityService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"/accessibility"})
    public ResponseEntity<AccessibilityResponseDTO> createAccessibility(@Valid @RequestBody AccessibilityRequestDTO accessibilityDTO) {
        var accessibility = accessibilityService.createAccessibility(accessibilityDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(accessibility);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/accessibility"})
    public ResponseEntity<Page<AccessibilityResponseDTO>> getAllAccessibility(
            @PageableDefault(
                    size = 20,
                    sort = "accessRamp") Pageable pageable){
        var accessibility = accessibilityService.getAllAccessibility(pageable);
        return ResponseEntity.ok(accessibility);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/accessibility/{accessibilityId}"})
    public ResponseEntity<AccessibilityResponseDTO> getAccessibilityById(@PathVariable UUID accessibilityId) {
        var accessibility = accessibilityService.getAccessibilityById(accessibilityId);
        return ResponseEntity.ok(accessibility);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping({"/accessibility/{accessibilityId}"})
    public ResponseEntity<AccessibilityResponseDTO> updateAccessibility(@Valid @PathVariable UUID accessibilityId,
                                                             @RequestBody AccessibilityRequestDTO accessibilityDTO) {
        var accessibility = accessibilityService.updateAccessibility(accessibilityId, accessibilityDTO);
        return ResponseEntity.ok(accessibility);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"/accessibility/{accessibilityId}"})
    public ResponseEntity<AccessibilityResponseDTO> deleteAccessibility(@Valid @PathVariable UUID accessibilityId) {
        var accessibility = accessibilityService.deleteAccessibility(accessibilityId);
        return ResponseEntity.ok(accessibility);
    }
}

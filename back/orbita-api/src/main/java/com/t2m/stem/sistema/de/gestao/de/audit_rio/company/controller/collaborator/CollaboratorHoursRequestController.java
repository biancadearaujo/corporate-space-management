package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.collaborator.CollaboratorHoursRequestService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/collaborator/hours-requests"})
@AllArgsConstructor
public class CollaboratorHoursRequestController {
    private CollaboratorHoursRequestService collaboratorHoursRequestService;

    @PreAuthorize("hasRole('COLLABORATOR')")
    @PostMapping
    public ResponseEntity<AdditionalHoursResponseDTO> collaboratorRequest(@Valid @RequestBody AdditionalHoursRequestDTO additionalHoursRequestDTO){
        var additionalHoursRequest = collaboratorHoursRequestService.collaboratorRequest(additionalHoursRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping
    public ResponseEntity<Page<AdditionalHoursResponseDTO>> getAllAdditionalHoursRequest(
            @PageableDefault(
                    size = 20,
                    sort = "createdAt") Pageable pageable){
        var additionalHoursRequest = collaboratorHoursRequestService.getAllAdditionalHoursRequest(pageable);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/status/{status}"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getAdditionalRequestByStatus(@PathVariable AdditionalHoursRequestStatus status) {
        var additionalHoursRequest = collaboratorHoursRequestService.getAdditionalRequestByStatus(status);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('COLLABORATOR')")
    @GetMapping({"/{additionalHoursRequestId}"})
    public ResponseEntity<AdditionalHoursResponseDTO> getAdditionalHoursRequestById(
            @PathVariable UUID additionalHoursRequestId) {
        var additionalHoursRequest = collaboratorHoursRequestService.getAdditionalHoursRequestById(additionalHoursRequestId);
        return ResponseEntity.ok(additionalHoursRequest);
    }
}

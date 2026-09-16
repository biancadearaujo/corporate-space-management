package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.manager;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.manager.ManagerHoursRequestService;
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
@RequestMapping({"/manager/additional-hours-request"})
@AllArgsConstructor
public class ManagerHoursRequestController {
    private ManagerHoursRequestService managerHoursRequestService;

    @PreAuthorize("hasRole('MANAGER')")
    @PostMapping
    public ResponseEntity<AdditionalHoursResponseDTO> managerRequest(@Valid @RequestBody AdditionalHoursRequestDTO additionalHoursRequestDTO){
        var additionalHoursRequest = managerHoursRequestService.managerDirectRequest(additionalHoursRequestDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @PutMapping("/review")
    public ResponseEntity<Void> managerReviewRequest(
            @RequestBody AdditionalHoursRequestDTO additionalHoursRequestDTO){
        managerHoursRequestService.managerReviewRequest(additionalHoursRequestDTO);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping
    public ResponseEntity<Page<AdditionalHoursResponseDTO>> getAllAdditionalHoursRequest(
            @PageableDefault(
                    size = 20,
                    sort = "createdAt") Pageable pageable){
        var additionalHoursRequest = managerHoursRequestService.getAllAdditionalHoursRequest(pageable);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/pending-manager-review"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getReviewRequest() {
        var additionalHoursRequest = managerHoursRequestService.getReviewRequest();
        return ResponseEntity.ok(additionalHoursRequest);
    }


    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/status/{status}"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getAdditionalRequestByStatus(@PathVariable AdditionalHoursRequestStatus status) {
        var additionalHoursRequest = managerHoursRequestService.getAdditionalRequestByStatus(status);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/{additionalHoursRequestId}"})
    public ResponseEntity<AdditionalHoursResponseDTO> getAdditionalHoursRequestById(
            @PathVariable UUID additionalHoursRequestId) {
        var additionalHoursRequest = managerHoursRequestService.getAdditionalHoursRequestById(additionalHoursRequestId);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('MANAGER')")
    @GetMapping({"/user/{userId}"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getAllAdditionalHoursRequestsByUserId(
            @PathVariable UUID userId) {
        var additionalHoursRequest = managerHoursRequestService.getAllAdditionalHoursRequestsByUserId(userId);
        return ResponseEntity.ok(additionalHoursRequest);
    }
}

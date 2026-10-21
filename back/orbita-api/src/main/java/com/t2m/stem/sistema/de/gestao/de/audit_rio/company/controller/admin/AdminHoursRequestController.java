package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.AdditionalHoursResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.ReviewRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.ReviewRequestResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.enums.AdditionalHoursRequestStatus;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin.AdminHoursRequestService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/admin/additional-hours-request"})
@AllArgsConstructor
public class AdminHoursRequestController {
    private AdminHoursRequestService adminHoursRequestService;

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/review")
    public ResponseEntity<Void> adminReviewRequest(@RequestBody ReviewRequestDTO reviewDTO){
        adminHoursRequestService.reviewRequest(reviewDTO);

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<AdditionalHoursResponseDTO>> getAllAdditionalHoursRequest(
            @PageableDefault(
                    size = 20,
                    sort = "createdAt") Pageable pageable){
        var additionalHoursRequest = adminHoursRequestService.getAllAdditionalHoursRequest(pageable);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/pending-admin-review"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getReviewRequest() {
        var additionalHoursRequest = adminHoursRequestService.getReviewRequest();
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/status/{status}"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getAdditionalRequestByStatus(@PathVariable AdditionalHoursRequestStatus status) {
        var additionalHoursRequest = adminHoursRequestService.getAdditionalRequestByStatus(status);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/{additionalHoursRequestId}"})
    public ResponseEntity<AdditionalHoursResponseDTO> getAdditionalHoursRequestById(
            @PathVariable UUID additionalHoursRequestId) {
        var additionalHoursRequest = adminHoursRequestService.getAdditionalHoursRequestById(additionalHoursRequestId);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/user/{userId}"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getAllAdditionalHoursRequestsByUserId(
            @PathVariable UUID userId) {
        var additionalHoursRequest = adminHoursRequestService.getAllAdditionalHoursRequestsByUserId(userId);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/company/{companyId}"})
    public ResponseEntity<List<AdditionalHoursResponseDTO>> getAllAdditionalHoursRequestsByCompanyId(
            @PathVariable UUID companyId) {
        var additionalHoursRequest = adminHoursRequestService.getAllAdditionalHoursRequestsByCompanyId(companyId);
        return ResponseEntity.ok(additionalHoursRequest);
    }

    @GetMapping({"/pending-admin-review-with-company"})
    public ResponseEntity<List<ReviewRequestResponseDTO>> getReviewRequestWithCompany() {
        var additionalHoursRequest = adminHoursRequestService.getReviewRequestWithCompany();
        return ResponseEntity.ok(additionalHoursRequest);
    }
}

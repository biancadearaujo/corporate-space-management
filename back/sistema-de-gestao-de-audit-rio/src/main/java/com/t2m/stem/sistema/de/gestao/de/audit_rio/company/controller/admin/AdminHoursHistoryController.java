package com.t2m.stem.sistema.de.gestao.de.audit_rio.company.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.model.dto.HoursApprovalResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.company.service.admin.AdminHoursHistoryService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping({"/admin/hours-approval-history"})
@AllArgsConstructor
public class AdminHoursHistoryController {
    private AdminHoursHistoryService adminHoursHistoryService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<Page<HoursApprovalResponseDTO>> getAllHoursHistory(
            @PageableDefault(
                    size = 20,
                    sort = "actionDate") Pageable pageable){
        var hoursApproval = adminHoursHistoryService.getAllHoursHistory(pageable);
        return ResponseEntity.ok(hoursApproval);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/{hoursApprovalId}"})
    public ResponseEntity<HoursApprovalResponseDTO> getHoursHistoryById(@PathVariable UUID hoursApprovalId){
        var hoursApproval = adminHoursHistoryService.getHoursHistoryById(hoursApprovalId);
        return ResponseEntity.ok(hoursApproval);
    }
}

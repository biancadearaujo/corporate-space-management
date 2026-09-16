package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.SubVenueRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.SubVenueResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.admin.AdminSubVenueService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/admin")
@AllArgsConstructor
public class AdminSubVenueController {
    private AdminSubVenueService adminSubVenueService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/sub-venue"})
    public ResponseEntity<Page<SubVenueResponseDTO>> getAllSubVenue(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var subVenue = adminSubVenueService.getAllVenues(pageable);
        return ResponseEntity.ok(subVenue);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/sub-venue/{subVenueId}"})
    public ResponseEntity<SubVenueResponseDTO> getSubVenueById(@PathVariable UUID subVenueId) {
        var subVenue = adminSubVenueService.getSubVenueById(subVenueId);
        return ResponseEntity.ok(subVenue);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping({"/sub-venue/{subVenueId}"})
    public ResponseEntity<SubVenueResponseDTO> updateSubVenue(@Valid @PathVariable UUID subVenueId,
                                                              @RequestBody SubVenueRequestDTO subVenueRequest) {
        var subVenue = adminSubVenueService.updateSubVenue(subVenueId, subVenueRequest);
        return ResponseEntity.ok(subVenue);
    }
}

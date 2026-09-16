package com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.VenueRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.dto.VenueResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.service.admin.AdminVenueService;
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
public class AdminVenueController {
    private AdminVenueService adminVenueService;

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping({"/venue"})
    public ResponseEntity<VenueResponseDTO> registerVenue(@Valid @RequestBody VenueRequestDTO venueDTO) {
        var venue = adminVenueService.createVenue(venueDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(venue);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/venue"})
    public ResponseEntity<Page<VenueResponseDTO>> getAllVenue(
            @PageableDefault(
                    size = 20,
                    sort = "name") Pageable pageable){
        var venue = adminVenueService.getAllVenues(pageable);
        return ResponseEntity.ok(venue);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping({"/venue/{venueId}"})
    public ResponseEntity<VenueResponseDTO> getVenueById(@PathVariable UUID venueId) {
        var venue = adminVenueService.getVenueById(venueId);
        return ResponseEntity.ok(venue);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping({"/venue/{venueId}"})
    public ResponseEntity<VenueResponseDTO> updateVenue(@Valid @PathVariable UUID venueId,
                                              @RequestBody VenueRequestDTO venueDTO) {
        var venue = adminVenueService.updateVenue(venueId, venueDTO);
        return ResponseEntity.ok(venue);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping({"/venue/{venueId}"})
    public ResponseEntity<Void> deleteVenue(@PathVariable UUID venueId) {
        adminVenueService.deleteVenue(venueId);
        return ResponseEntity.noContent().build();
    }
}

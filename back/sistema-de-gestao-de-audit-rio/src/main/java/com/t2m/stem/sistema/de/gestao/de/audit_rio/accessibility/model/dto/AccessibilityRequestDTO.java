package com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;

import java.util.List;

public record AccessibilityRequestDTO(
        Boolean accessRamp,
        Boolean elevator,
        Boolean accessibleBathroom,
        Boolean accessibleParking,
        Boolean directionalTactileFlooring,
        Boolean brailleSignage,
        Boolean audioGuidanceSystem,
        List<Venue> venues
) {
}

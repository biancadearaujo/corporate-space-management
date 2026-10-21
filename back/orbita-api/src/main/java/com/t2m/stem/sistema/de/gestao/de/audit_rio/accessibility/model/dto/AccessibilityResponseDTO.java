package com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.dto;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.Accessibility;

import java.util.UUID;

public record AccessibilityResponseDTO(
        UUID accessibilityId,
        Boolean accessRamp,
        Boolean elevator,
        Boolean accessibleBathroom,
        Boolean accessibleParking,
        Boolean directionalTactileFlooring,
        Boolean brailleSignage,
        Boolean audioGuidanceSystem
) {
    public static AccessibilityResponseDTO from(Accessibility accessibility) {
        return new AccessibilityResponseDTO(
                accessibility.getAccessibilityId(),
                accessibility.getAccessRamp(),
                accessibility.getElevator(),
                accessibility.getAccessibleBathroom(),
                accessibility.getAccessibleParking(),
                accessibility.getDirectionalTactileFlooring(),
                accessibility.getBrailleSignage(),
                accessibility.getAudioGuidanceSystem()
        );
    }
}

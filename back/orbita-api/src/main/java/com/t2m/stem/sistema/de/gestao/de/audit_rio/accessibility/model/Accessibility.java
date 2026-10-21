package com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.UUID;

@Data
@Entity(name="accessibility")
public class Accessibility {
    @Id
    @GeneratedValue(generator = "UUID")
    private UUID accessibilityId;

    @Column(name="access_ramp")
    private Boolean accessRamp;

    @Column(name="elevator")
    private Boolean elevator;

    @Column(name="accessible_bathroom")
    private Boolean accessibleBathroom;

    @Column(name="accessible_parking")
    private Boolean accessibleParking;

    @Column(name="directional_tactile_flooring")
    private Boolean directionalTactileFlooring;

    @Column(name="braille_signage")
    private Boolean brailleSignage;

    @Column(name="audio_guidance_system")
    private Boolean audioGuidanceSystem;
}

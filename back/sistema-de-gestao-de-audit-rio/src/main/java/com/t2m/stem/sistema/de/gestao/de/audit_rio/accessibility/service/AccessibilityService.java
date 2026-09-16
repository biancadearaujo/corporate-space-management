package com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.service;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.Accessibility;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.dto.AccessibilityRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.model.dto.AccessibilityResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.accessibility.repository.AccessibilityRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class AccessibilityService {
    private AccessibilityRepository accessibilityRepository;
    private UserValidator userValidator;

    public Page<AccessibilityResponseDTO> getAllAccessibility(Pageable pageable) {
        userValidator.validateAdminAccess();

        return accessibilityRepository.findAll(pageable)
                .map(AccessibilityResponseDTO::from);
    }

    public AccessibilityResponseDTO getAccessibilityById(UUID accessibilityId) {
        userValidator.validateAdminAccess();

        return accessibilityRepository.findById(accessibilityId)
                .map(AccessibilityResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Accessibility not found"));
    }

    @Transactional
    public AccessibilityResponseDTO createAccessibility(AccessibilityRequestDTO accessibilityDTO) {
        userValidator.validateAdminAccess();

        Accessibility accessibility = new Accessibility();

        accessibility.setAccessRamp(accessibilityDTO.accessRamp());
        accessibility.setElevator(accessibilityDTO.elevator());
        accessibility.setAccessibleBathroom(accessibilityDTO.accessibleBathroom());
        accessibility.setAccessibleParking(accessibilityDTO.accessibleParking());
        accessibility.setDirectionalTactileFlooring(accessibilityDTO.directionalTactileFlooring());
        accessibility.setBrailleSignage(accessibilityDTO.brailleSignage());
        accessibility.setAudioGuidanceSystem(accessibilityDTO.audioGuidanceSystem());

        Accessibility created = accessibilityRepository.save(accessibility);

        return AccessibilityResponseDTO.from(created);
    }

    @Transactional
    public AccessibilityResponseDTO updateAccessibility(UUID accessibilityId , AccessibilityRequestDTO accessibilityDTO) {
        userValidator.validateAdminAccess();

        Accessibility accessibility = accessibilityRepository.findById(accessibilityId).orElseThrow(() ->
                new NotFoundException("Accessibility not found"));

        if (accessibilityDTO.accessRamp() != null) {
            accessibility.setAccessRamp(accessibilityDTO.accessRamp());
        }
        if (accessibilityDTO.elevator() != null) {
            accessibility.setElevator(accessibilityDTO.elevator());
        }
        if (accessibilityDTO.accessibleBathroom() != null) {
            accessibility.setAccessibleBathroom(accessibilityDTO.accessibleBathroom());
        }
        if (accessibilityDTO.accessibleParking() != null) {
            accessibility.setAccessibleParking(accessibilityDTO.accessibleParking());
        }
        if (accessibilityDTO.directionalTactileFlooring() != null) {
            accessibility.setDirectionalTactileFlooring(accessibilityDTO.directionalTactileFlooring());
        }
        if (accessibilityDTO.brailleSignage() != null) {
            accessibility.setBrailleSignage(accessibilityDTO.brailleSignage());
        }
        if (accessibilityDTO.audioGuidanceSystem() != null) {
            accessibility.setAudioGuidanceSystem(accessibilityDTO.audioGuidanceSystem());
        }

        Accessibility updated = accessibilityRepository.save(accessibility);

        return AccessibilityResponseDTO.from(updated);
    }

    @Transactional
    public AccessibilityResponseDTO deleteAccessibility(UUID accessibilityId) {
        userValidator.validateAdminAccess();

        Accessibility accessibility = accessibilityRepository.findById(accessibilityId).orElseThrow(() ->
                new NotFoundException("Accessibility not found"));

        accessibility.setAccessRamp(false);
        accessibility.setElevator(false);
        accessibility.setAccessibleBathroom(false);
        accessibility.setAccessibleParking(false);
        accessibility.setDirectionalTactileFlooring(false);
        accessibility.setBrailleSignage(false);
        accessibility.setAudioGuidanceSystem(false);

        Accessibility deleted = accessibilityRepository.save(accessibility);

        return AccessibilityResponseDTO.from(deleted);
    }
}

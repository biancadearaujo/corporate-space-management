package com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.service.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.Equipment;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentRequestDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.model.dto.EquipmentUpdateDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.equipment.repository.EquipmentRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.SubVenue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.model.Venue;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.SubVenueRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.venue.repository.VenueRepository;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class AdminEquipmentService {
    private EquipmentRepository equipmentRepository;
    private UserValidator userValidator;
    private VenueRepository venueRepository;
    private SubVenueRepository subVenueRepository;

    public Page<EquipmentResponseDTO> getAllEquipment(Pageable pageable){
        userValidator.validateAdminAccess();

        return equipmentRepository.findAll(pageable)
                .map(EquipmentResponseDTO::from);
    }

    public EquipmentResponseDTO getEquipmentById(UUID equipmentId){
        userValidator.validateAdminAccess();

        return equipmentRepository.findById(equipmentId)
                .map(EquipmentResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Equipment not found."));

    }

    public EquipmentResponseDTO getEquipmentBySerialNumber(String serialNumber){
        userValidator.validateAdminAccess();

        return equipmentRepository.findBySerialNumber(serialNumber)
                .map(EquipmentResponseDTO::from)
                .orElseThrow(() -> new NotFoundException("Equipment not found."));
    }

    @Transactional
    public EquipmentResponseDTO createEquipment(EquipmentRequestDTO equipmentDTO){
        userValidator.validateAdminAccess();

        Equipment equipment = new Equipment();

        equipment.setSerialNumber(equipmentDTO.serialNumber());
        equipment.setName(equipmentDTO.name());
        equipment.setConservationStatus(equipmentDTO.conservationStatus());
        equipment.setAvailable(equipmentDTO.available());

        if (equipmentDTO.venueId() != null) {
            Venue venue = venueRepository.findById(equipmentDTO.venueId())
                    .orElseThrow(() -> new NotFoundException("Venue not found"));
            equipment.setVenue(venue);
        }

        if (equipmentDTO.subVenueId() != null) {
            SubVenue subVenue = subVenueRepository.findById(equipmentDTO.subVenueId())
                    .orElseThrow(() -> new NotFoundException("SubVenue not found"));

            if (equipmentDTO.venueId() != null && !subVenue.getVenue().getVenueId().equals(equipmentDTO.venueId())) {
                throw new IllegalArgumentException("SubVenue does not belong to the selected Venue");
            }

            equipment.setSubVenue(subVenue);
        }

        Equipment created = equipmentRepository.save(equipment);

        return EquipmentResponseDTO.from(created);
    }

    @Transactional
    public EquipmentResponseDTO updateEquipment(UUID equipmentId, EquipmentUpdateDTO equipmentDTO){
        userValidator.validateAdminAccess();

        Equipment equipment = equipmentRepository.findById(equipmentId).orElseThrow(() ->
                new NotFoundException("Equipment not found."));

        if (equipmentDTO.name() != null){
            equipment.setName(equipmentDTO.name());
        }
        if (equipmentDTO.conservationStatus() != null){
            equipment.setConservationStatus(equipmentDTO.conservationStatus());
        }
        if (equipmentDTO.available() != null){
            equipment.setAvailable(equipmentDTO.available());
        }

        if (equipmentDTO.venueId() != null) {
            Venue newVenue = venueRepository.findById(equipmentDTO.venueId())
                    .orElseThrow(() -> new NotFoundException("Venue not found"));
            equipment.setVenue(newVenue);
        }

        Equipment updated = equipmentRepository.save(equipment);

        return EquipmentResponseDTO.from(updated);
    }

    @Transactional
    public void deleteEquipment(UUID equipmentId){
        userValidator.validateAdminAccess();

        equipmentRepository.findById(equipmentId)
                .orElseThrow(() -> new NotFoundException("Equipment not found."));

        equipmentRepository.deleteById(equipmentId);
    }
}

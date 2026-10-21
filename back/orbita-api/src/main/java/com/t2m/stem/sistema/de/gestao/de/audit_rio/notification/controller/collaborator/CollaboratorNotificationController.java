package com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.controller.collaborator;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.Notification;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.dto.NotificationResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.repository.NotificationRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/collaborator")
@AllArgsConstructor
public class CollaboratorNotificationController {
    private NotificationRepository notificationRepository;
    private UserValidator userValidator;

    @GetMapping("/notifications")
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications() {
        User currentUser = userValidator.getAuthenticatedUser();

        List<Notification> list = notificationRepository.findByRecipientOrderByCreatedAtDesc(currentUser);

        List<NotificationResponseDTO> dtos = list.stream()
                .map(NotificationResponseDTO::from)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PutMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found."));

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/notifications")
    @Transactional
    public ResponseEntity<Void> clearAllNotifications() {
        User currentUser = userValidator.getAuthenticatedUser();
        notificationRepository.deleteAllByRecipient(currentUser);
        return ResponseEntity.noContent().build();
    }
}

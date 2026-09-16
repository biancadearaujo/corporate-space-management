package com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.controller.admin;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.errors.NotFoundException;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.Notification;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.dto.NotificationResponseDTO;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.repository.NotificationRepository;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.validator.UserValidator;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/notifications")
@AllArgsConstructor
public class AdminNotificationController {
    private NotificationRepository notificationRepository;
    private UserValidator userValidator;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<List<NotificationResponseDTO>> getMyNotifications() {
        User currentUser = userValidator.getAuthenticatedUser();

        List<Notification> notifs = notificationRepository
                .findByRecipientAndReadFalseOrderByCreatedAtDesc(currentUser);

        var dtos = notifs.stream()
                .map(NotificationResponseDTO::from)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Notificação não encontrada"));

        notification.setRead(true);
        notificationRepository.save(notification);

        return ResponseEntity.noContent().build();
    }
}

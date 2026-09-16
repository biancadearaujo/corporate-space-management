package com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.enums.NotificationType;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String title;
    private String message;

    @Enumerated(EnumType.STRING)
    private NotificationType type;

    private boolean read = false;

    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne
    private User recipient;
}

package com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.repository;

import com.t2m.stem.sistema.de.gestao.de.audit_rio.notification.model.Notification;
import com.t2m.stem.sistema.de.gestao.de.audit_rio.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NotificationRepository extends JpaRepository<Notification, UUID> {
    List<Notification> findByRecipientOrderByCreatedAtDesc(User currentUser);
    void deleteAllByRecipient(User recipient);

    List<Notification> findByRecipientAndReadFalseOrderByCreatedAtDesc(User currentUser);
}

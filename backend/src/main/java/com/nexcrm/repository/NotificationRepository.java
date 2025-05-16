package com.nexcrm.repository;

import com.nexcrm.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByRecipientId(Long recipientId);
    List<Notification> findByRecipientIdAndReadFalse(Long recipientId);
    int countByRecipientIdAndReadFalse(Long recipientId);
} 
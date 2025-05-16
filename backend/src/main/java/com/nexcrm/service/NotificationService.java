package com.nexcrm.service;

import com.nexcrm.dto.NotificationDto;
import com.nexcrm.model.Notification;
import com.nexcrm.model.User;
import com.nexcrm.repository.NotificationRepository;
import com.nexcrm.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationDto toDto(Notification notification) {
        return NotificationDto.builder()
                .id(notification.getId())
                .message(notification.getMessage())
                .type(notification.getType())
                .recipientId(notification.getRecipient().getId())
                .recipientUsername(notification.getRecipient().getUsername())
                .senderId(notification.getSender() != null ? notification.getSender().getId() : null)
                .senderUsername(notification.getSender() != null ? notification.getSender().getUsername() : null)
                .entityId(notification.getEntityId())
                .entityType(notification.getEntityType())
                .read(notification.isRead())
                .creationDate(notification.getCreationDate())
                .build();
    }

    private Notification toEntity(NotificationDto dto) {
        User recipient = userRepository.findById(dto.getRecipientId())
                .orElseThrow(() -> new EntityNotFoundException("Destinataire non trouvé avec ID: " + dto.getRecipientId()));

        User sender = null;
        if (dto.getSenderId() != null) {
            sender = userRepository.findById(dto.getSenderId())
                    .orElseThrow(() -> new EntityNotFoundException("Expéditeur non trouvé avec ID: " + dto.getSenderId()));
        }

        return Notification.builder()
                .id(dto.getId())
                .message(dto.getMessage())
                .type(dto.getType())
                .recipient(recipient)
                .sender(sender)
                .entityId(dto.getEntityId())
                .entityType(dto.getEntityType())
                .read(dto.isRead())
                .creationDate(dto.getCreationDate() != null ? dto.getCreationDate() : LocalDateTime.now())
                .build();
    }

    @Transactional
    public NotificationDto createNotification(NotificationDto dto) {
        log.info("Création d'une notification pour utilisateur {}", dto.getRecipientId());
        Notification notification = toEntity(dto);
        Notification savedNotification = notificationRepository.save(notification);
        return toDto(savedNotification);
    }

    @Transactional
    public void createMentionNotification(Long senderId, Long recipientId, Long commentId, String commentContent, Long taskId) {
        if (senderId.equals(recipientId)) {
            log.info("Pas de notification pour l'auteur du commentaire");
            return; // Pas de notification quand on se mentionne soi-même
        }

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new EntityNotFoundException("Expéditeur non trouvé avec ID: " + senderId));
        
        User recipient = userRepository.findById(recipientId)
                .orElseThrow(() -> new EntityNotFoundException("Destinataire non trouvé avec ID: " + recipientId));

        String message = sender.getUsername() + " vous a mentionné dans un commentaire";

        Notification notification = Notification.builder()
                .message(message)
                .type("MENTION")
                .recipient(recipient)
                .sender(sender)
                .entityId(commentId)
                .entityType("COMMENT")
                .read(false)
                .build();

        notificationRepository.save(notification);
        log.info("Notification de mention créée de {} vers {}", sender.getUsername(), recipient.getUsername());
    }

    @Transactional
    public NotificationDto markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new EntityNotFoundException("Notification non trouvée avec ID: " + notificationId));

        notification.setRead(true);
        Notification updatedNotification = notificationRepository.save(notification);
        return toDto(updatedNotification);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadFalse(userId);
        unreadNotifications.forEach(notification -> notification.setRead(true));
        notificationRepository.saveAll(unreadNotifications);
        log.info("{} notifications marquées comme lues pour utilisateur {}", unreadNotifications.size(), userId);
    }

    public List<NotificationDto> findByRecipientId(Long userId) {
        return notificationRepository.findByRecipientId(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<NotificationDto> findUnreadByRecipientId(Long userId) {
        return notificationRepository.findByRecipientIdAndReadFalse(userId).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public int countUnreadByRecipientId(Long userId) {
        return notificationRepository.countByRecipientIdAndReadFalse(userId);
    }

    public Optional<NotificationDto> findById(Long id) {
        return notificationRepository.findById(id).map(this::toDto);
    }

    @Transactional
    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }
} 
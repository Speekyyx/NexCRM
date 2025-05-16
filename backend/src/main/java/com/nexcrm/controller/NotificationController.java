package com.nexcrm.controller;

import com.nexcrm.dto.NotificationDto;
import com.nexcrm.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;
    
    // Cache pour limiter les logs sur les appels fréquents
    private final Map<String, Instant> lastLoggedTime = new ConcurrentHashMap<>();
    // Intervalle minimum entre les logs (en secondes) - augmenté à 30 secondes
    private static final int LOG_THROTTLE_SECONDS = 30;
    
    // Cache temporaire pour les résultats des requêtes
    private final Map<String, CachedResponse<List<NotificationDto>>> notificationsCache = new ConcurrentHashMap<>();
    private final Map<String, CachedResponse<Integer>> countCache = new ConcurrentHashMap<>();
    
    // Durée de validité du cache (en secondes)
    private static final int CACHE_VALIDITY_SECONDS = 60; // 1 minute
    
    /**
     * Classe pour stocker les réponses en cache avec leur timestamp
     */
    private static class CachedResponse<T> {
        private final T data;
        private final Instant timestamp;
        
        public CachedResponse(T data) {
            this.data = data;
            this.timestamp = Instant.now();
        }
        
        public T getData() {
            return data;
        }
        
        public boolean isValid() {
            return ChronoUnit.SECONDS.between(timestamp, Instant.now()) < CACHE_VALIDITY_SECONDS;
        }
    }

    /**
     * Détermine si un log doit être émis en fonction de l'intervalle configuré
     * @param key Clé identifiant le type de log
     * @return true si le log doit être émis, false sinon
     */
    private boolean shouldLog(String key) {
        Instant now = Instant.now();
        Instant lastLog = lastLoggedTime.getOrDefault(key, Instant.EPOCH);
        
        if (ChronoUnit.SECONDS.between(lastLog, now) >= LOG_THROTTLE_SECONDS) {
            lastLoggedTime.put(key, now);
            return true;
        }
        return false;
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<NotificationDto>> getNotificationsByUserId(@PathVariable Long userId) {
        String cacheKey = "notifications-" + userId;
        String logKey = "getNotifications-" + userId;
        
        // Vérifier le cache
        CachedResponse<List<NotificationDto>> cachedResponse = notificationsCache.get(cacheKey);
        if (cachedResponse != null && cachedResponse.isValid()) {
            // Utiliser les données en cache
            return ResponseEntity.ok(cachedResponse.getData());
        }
        
        if (shouldLog(logKey)) {
            log.info("Requête pour récupérer les notifications de l'utilisateur ID: {}", userId);
        }
        
        List<NotificationDto> notifications = notificationService.findByRecipientId(userId);
        
        // Mettre en cache le résultat
        notificationsCache.put(cacheKey, new CachedResponse<>(notifications));
        
        if (shouldLog(logKey)) {
            log.info("Nombre de notifications récupérées: {}", notifications.size());
        }
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDto>> getUnreadNotificationsByUserId(@PathVariable Long userId) {
        String cacheKey = "unread-notifications-" + userId;
        String logKey = "getUnreadNotifications-" + userId;
        
        // Vérifier le cache
        CachedResponse<List<NotificationDto>> cachedResponse = notificationsCache.get(cacheKey);
        if (cachedResponse != null && cachedResponse.isValid()) {
            // Utiliser les données en cache
            return ResponseEntity.ok(cachedResponse.getData());
        }
        
        if (shouldLog(logKey)) {
            log.info("Requête pour récupérer les notifications non lues de l'utilisateur ID: {}", userId);
        }
        
        List<NotificationDto> notifications = notificationService.findUnreadByRecipientId(userId);
        
        // Mettre en cache le résultat
        notificationsCache.put(cacheKey, new CachedResponse<>(notifications));
        
        if (shouldLog(logKey)) {
            log.info("Nombre de notifications non lues récupérées: {}", notifications.size());
        }
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/user/{userId}/count-unread")
    public ResponseEntity<Integer> countUnreadNotifications(@PathVariable Long userId) {
        String cacheKey = "count-unread-" + userId;
        String logKey = "countUnread-" + userId;
        
        // Vérifier le cache
        CachedResponse<Integer> cachedCount = countCache.get(cacheKey);
        if (cachedCount != null && cachedCount.isValid()) {
            // Utiliser le compteur en cache
            return ResponseEntity.ok(cachedCount.getData());
        }
        
        if (shouldLog(logKey)) {
            log.info("Requête pour compter les notifications non lues de l'utilisateur ID: {}", userId);
        }
        
        int count = notificationService.countUnreadByRecipientId(userId);
        
        // Mettre en cache le résultat
        countCache.put(cacheKey, new CachedResponse<>(count));
        
        if (shouldLog(logKey)) {
            log.info("Nombre de notifications non lues: {}", count);
        }
        return ResponseEntity.ok(count);
    }

    @PutMapping("/{notificationId}/read")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long notificationId) {
        log.info("Requête pour marquer la notification ID: {} comme lue", notificationId);
        NotificationDto notification = notificationService.markAsRead(notificationId);
        
        // Invalider le cache lorsqu'une notification est marquée comme lue
        invalidateUserCache(notification.getRecipientId());
        
        return ResponseEntity.ok(notification);
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Void> markAllAsRead(@PathVariable Long userId) {
        log.info("Requête pour marquer toutes les notifications de l'utilisateur ID: {} comme lues", userId);
        notificationService.markAllAsRead(userId);
        
        // Invalider le cache pour cet utilisateur
        invalidateUserCache(userId);
        
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long notificationId) {
        log.info("Requête pour supprimer la notification ID: {}", notificationId);
        
        // Récupérer la notification pour obtenir l'ID du destinataire
        NotificationDto notification = notificationService.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification non trouvée"));
        
        notificationService.delete(notificationId);
        
        // Invalider le cache pour cet utilisateur
        invalidateUserCache(notification.getRecipientId());
        
        return ResponseEntity.noContent().build();
    }

    @PostMapping
    public ResponseEntity<NotificationDto> createNotification(@RequestBody NotificationDto notificationDto) {
        log.info("Requête pour créer une notification pour l'utilisateur ID: {}", notificationDto.getRecipientId());
        NotificationDto createdNotification = notificationService.createNotification(notificationDto);
        
        // Invalider le cache pour cet utilisateur
        invalidateUserCache(notificationDto.getRecipientId());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotification);
    }
    
    /**
     * Invalide toutes les entrées de cache liées à un utilisateur
     */
    private void invalidateUserCache(Long userId) {
        notificationsCache.remove("notifications-" + userId);
        notificationsCache.remove("unread-notifications-" + userId);
        countCache.remove("count-unread-" + userId);
    }
} 
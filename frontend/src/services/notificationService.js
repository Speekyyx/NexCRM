import api from './api';

// Cache pour les notifications
let notificationsCache = {
  lastFetch: 0,
  data: {},
  unreadCount: {},
  pendingRequests: {},
  failedRequests: {},
  maxRetries: 3
};

// Temps de validité du cache en ms (10 minutes au lieu de 5 minutes)
const CACHE_VALIDITY = 600000;

// Temps maximum d'attente pour une requête en ms
const REQUEST_TIMEOUT = 5000;

// Fonction pour créer une promise avec timeout
const withTimeout = (promise, timeoutMs = REQUEST_TIMEOUT) => {
  let timeoutId;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error('La requête a pris trop de temps'));
    }, timeoutMs);
  });

  return Promise.race([
    promise,
    timeoutPromise
  ]).finally(() => {
    clearTimeout(timeoutId);
  });
};

// Fonction pour vérifier si une requête est déjà en cours
const isRequestPending = (key) => {
  return notificationsCache.pendingRequests[key];
};

// Fonction pour marquer une requête comme en cours
const markRequestPending = (key, isPending = true) => {
  notificationsCache.pendingRequests[key] = isPending;
};

// Fonction pour incrémenter le compteur d'échecs
const incrementFailCount = (key) => {
  notificationsCache.failedRequests[key] = (notificationsCache.failedRequests[key] || 0) + 1;
  return notificationsCache.failedRequests[key];
};

// Fonction pour réinitialiser le compteur d'échecs
const resetFailCount = (key) => {
  notificationsCache.failedRequests[key] = 0;
};

export const notificationService = {
  /**
   * Récupère toutes les notifications d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   */
  getNotificationsByUserId: async (userId) => {
    try {
      const cacheKey = `notifications_${userId}`;
      
      // Vérifier si trop de tentatives échouées
      if (notificationsCache.failedRequests[cacheKey] >= notificationsCache.maxRetries) {
        console.warn(`Trop de tentatives échouées pour ${cacheKey}`);
        return notificationsCache.data[userId] || [];
      }
      
      // Utiliser le cache si les données sont récentes
      const now = Date.now();
      if (notificationsCache.data[userId] && (now - notificationsCache.lastFetch < CACHE_VALIDITY)) {
        return notificationsCache.data[userId];
      }
      
      // Vérifier si une requête est déjà en cours
      if (isRequestPending(cacheKey)) {
        // Retourner les données en cache si disponibles ou un tableau vide
        return notificationsCache.data[userId] || [];
      }
      
      // Marquer la requête comme en cours
      markRequestPending(cacheKey, true);
      
      // Utiliser le chemin relatif pour profiter du proxy Vite, avec timeout
      const response = await withTimeout(api.get(`/notifications/user/${userId}`));
      
      // Mettre à jour le cache avec un maximum de 20 notifications
      const limitedData = Array.isArray(response.data) ? response.data.slice(0, 20) : [];
      notificationsCache.data[userId] = limitedData;
      notificationsCache.lastFetch = now;
      
      // Réinitialiser le compteur d'échecs
      resetFailCount(cacheKey);
      
      // Marquer la requête comme terminée
      markRequestPending(cacheKey, false);
      
      return limitedData;
    } catch (error) {
      // Incrémenter le compteur d'échecs
      const failCount = incrementFailCount(`notifications_${userId}`);
      
      // Marquer la requête comme terminée même en cas d'erreur
      markRequestPending(`notifications_${userId}`, false);
      
      console.error(`Erreur lors de la récupération des notifications (tentative ${failCount}):`, error);
      
      // Retourner un tableau vide en cas d'erreur pour éviter de bloquer l'interface
      return notificationsCache.data[userId] || [];
    }
  },

  /**
   * Récupère les notifications non lues d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   */
  getUnreadNotificationsByUserId: async (userId) => {
    try {
      const cacheKey = `unread_${userId}`;
      
      // Vérifier si trop de tentatives échouées
      if (notificationsCache.failedRequests[cacheKey] >= notificationsCache.maxRetries) {
        return [];
      }
      
      // Vérifier si une requête est déjà en cours
      if (isRequestPending(cacheKey)) {
        return [];
      }
      
      markRequestPending(cacheKey, true);
      const response = await withTimeout(api.get(`/notifications/user/${userId}/unread`));
      markRequestPending(cacheKey, false);
      
      // Réinitialiser le compteur d'échecs
      resetFailCount(cacheKey);
      
      return response.data;
    } catch (error) {
      // Incrémenter le compteur d'échecs
      incrementFailCount(`unread_${userId}`);
      
      markRequestPending(`unread_${userId}`, false);
      console.error('Erreur lors de la récupération des notifications non lues:', error);
      return [];
    }
  },

  /**
   * Compte le nombre de notifications non lues d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   */
  countUnreadNotifications: async (userId) => {
    try {
      const cacheKey = `count_${userId}`;
      
      // Vérifier si trop de tentatives échouées
      if (notificationsCache.failedRequests[cacheKey] >= notificationsCache.maxRetries) {
        return notificationsCache.unreadCount[userId] || 0;
      }
      
      // Utiliser le cache si les données sont récentes
      const now = Date.now();
      if (notificationsCache.unreadCount[userId] !== undefined && 
          (now - notificationsCache.lastFetch < CACHE_VALIDITY)) {
        return notificationsCache.unreadCount[userId];
      }
      
      // Vérifier si une requête est déjà en cours
      if (isRequestPending(cacheKey)) {
        return notificationsCache.unreadCount[userId] || 0;
      }
      
      markRequestPending(cacheKey, true);
      const response = await withTimeout(api.get(`/notifications/user/${userId}/count-unread`));
      markRequestPending(cacheKey, false);
      
      // Réinitialiser le compteur d'échecs
      resetFailCount(cacheKey);
      
      // Mettre à jour le cache
      notificationsCache.unreadCount[userId] = response.data;
      notificationsCache.lastFetch = now;
      
      return response.data;
    } catch (error) {
      // Incrémenter le compteur d'échecs
      incrementFailCount(`count_${userId}`);
      
      markRequestPending(`count_${userId}`, false);
      console.error('Erreur lors du comptage des notifications non lues:', error);
      // Retourner 0 en cas d'erreur pour éviter de bloquer l'interface
      return 0;
    }
  },

  /**
   * Marque une notification comme lue
   * @param {string} notificationId ID de la notification
   */
  markAsRead: async (notificationId) => {
    try {
      const response = await withTimeout(api.put(`/notifications/${notificationId}/read`));
      
      // Invalider le cache après avoir marqué une notification comme lue
      notificationsCache.lastFetch = 0;
      
      return response.data;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      throw error;
    }
  },

  /**
   * Marque toutes les notifications d'un utilisateur comme lues
   * @param {string} userId ID de l'utilisateur
   */
  markAllAsRead: async (userId) => {
    try {
      await withTimeout(api.put(`/notifications/user/${userId}/read-all`));
      
      // Mettre à jour le cache après avoir marqué toutes les notifications comme lues
      if (notificationsCache.data[userId]) {
        notificationsCache.data[userId] = notificationsCache.data[userId].map(n => ({...n, read: true}));
      }
      notificationsCache.unreadCount[userId] = 0;
      notificationsCache.lastFetch = Date.now();
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      throw error;
    }
  },

  /**
   * Supprime une notification
   * @param {string} notificationId ID de la notification
   */
  deleteNotification: async (notificationId) => {
    try {
      await withTimeout(api.delete(`/notifications/${notificationId}`));
      
      // Invalider le cache après avoir supprimé une notification
      notificationsCache.lastFetch = 0;
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      throw error;
    }
  },
  
  /**
   * Efface le cache des notifications
   */
  clearCache: () => {
    notificationsCache = {
      lastFetch: 0,
      data: {},
      unreadCount: {},
      pendingRequests: {},
      failedRequests: {},
      maxRetries: 3
    };
  },
  
  /**
   * Active ou désactive les logs de cache (fonction conservée pour compatibilité)
   * @param {boolean} enabled true pour activer, false pour désactiver
   */
  setLogsEnabled: (enabled) => {
    // Ne fait rien, les logs sont complètement désactivés
  }
}; 
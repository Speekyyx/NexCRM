import api from './api';
import axios from 'axios';

/**
 * Service pour gérer les pièces jointes
 */
export const attachmentService = {
  /**
   * Récupère toutes les pièces jointes d'une tâche
   * @param {number} taskId - L'identifiant de la tâche
   * @returns {Promise<Array>} - Les pièces jointes de la tâche
   */
  getAttachmentsByTaskId: async (taskId) => {
    try {
      const response = await api.get(`/attachments/task/${taskId}`);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des pièces jointes:', error);
      throw error;
    }
  },

  /**
   * Récupère une pièce jointe par son identifiant
   * @param {number} id - L'identifiant de la pièce jointe
   * @returns {Promise<Object>} - La pièce jointe
   */
  getAttachmentById: async (id) => {
    try {
      const response = await api.get(`/attachments/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la pièce jointe ${id}:`, error);
      throw error;
    }
  },

  /**
   * Télécharge une pièce jointe
   * @param {object} file - Le fichier à télécharger
   * @param {number} taskId - L'identifiant de la tâche
   * @returns {Promise<Object>} - La pièce jointe créée
   */
  uploadAttachment: async (file, taskId) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', taskId);
      
      // Récupérer l'utilisateur actuel du localStorage
      const userJson = localStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        if (user && user.id) {
          formData.append('userId', user.id);
        }
      }

      // Récupérer le token JWT
      const token = localStorage.getItem('token');
      
      // Configurer les en-têtes avec l'autorisation
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Utiliser axios directement pour gérer le multipart/form-data
      const response = await axios.post('/api/attachments/upload', formData, { headers });

      return response.data;
    } catch (error) {
      console.error('Erreur lors du téléchargement de la pièce jointe:', error);
      throw error;
    }
  },

  /**
   * Supprime une pièce jointe
   * @param {number} id - L'identifiant de la pièce jointe
   * @returns {Promise<void>}
   */
  deleteAttachment: async (id) => {
    try {
      await api.delete(`/attachments/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la pièce jointe ${id}:`, error);
      throw error;
    }
  },

  /**
   * Obtient l'URL de téléchargement d'une pièce jointe
   * @param {number} id - L'identifiant de la pièce jointe
   * @returns {string} - L'URL de téléchargement
   */
  getDownloadUrl: (id) => {
    const baseUrl = `/api/attachments/${id}/download`;
    const token = localStorage.getItem('token');
    
    // Si nous avons un token, l'ajouter en tant que paramètre de requête
    // pour les téléchargements dans une nouvelle fenêtre
    if (token) {
      return `${baseUrl}?token=${token}`;
    }
    
    return baseUrl;
  }
}; 
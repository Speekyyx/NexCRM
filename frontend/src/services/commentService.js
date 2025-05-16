import api from './api';

export const commentService = {
  /**
   * Récupère tous les commentaires
   */
  getAllComments: async () => {
    const response = await api.get('/comments');
    return response.data;
  },

  /**
   * Récupère un commentaire par son ID
   * @param {string} id ID du commentaire
   */
  getCommentById: async (id) => {
    const response = await api.get(`/comments/${id}`);
    return response.data;
  },

  /**
   * Récupère tous les commentaires associés à une tâche
   * @param {string} taskId ID de la tâche
   */
  getCommentsByTaskId: async (taskId) => {
    try {
      const response = await api.get(`/comments/task/${taskId}`);
      console.log(`Service commentaire - Commentaires reçus pour tâche ${taskId}:`, response.data);
      
      if (response.data) {
        response.data.forEach(comment => {
          console.log(`Commentaire ${comment.id} - mentions utilisateurs:`, comment.mentionedUserIds, 
                       "mentions clients:", comment.mentionedClientIds);
        });
      }
      
      return response.data;
    } catch (error) {
      console.error(`Service commentaire - Erreur lors de la récupération pour tâche ${taskId}:`, error);
      throw error;
    }
  },

  /**
   * Récupère tous les commentaires d'un utilisateur
   * @param {string} userId ID de l'utilisateur
   */
  getCommentsByUserId: async (userId) => {
    const response = await api.get(`/comments/user/${userId}`);
    return response.data;
  },

  /**
   * Crée un nouveau commentaire
   * @param {Object} commentData Données du commentaire
   */
  createComment: async (commentData) => {
    console.log("Service commentaire - Création avec données:", commentData);
    try {
      const response = await api.post('/comments', commentData);
      console.log("Service commentaire - Réponse de l'API:", response.data);
      return response.data;
    } catch (error) {
      console.error("Service commentaire - Erreur lors de la création:", error);
      throw error;
    }
  },

  /**
   * Met à jour un commentaire existant
   * @param {string} id ID du commentaire
   * @param {Object} commentData Données du commentaire
   */
  updateComment: async (id, commentData) => {
    const response = await api.put(`/comments/${id}`, commentData);
    return response.data;
  },

  /**
   * Supprime un commentaire
   * @param {string} id ID du commentaire
   */
  deleteComment: async (id) => {
    const response = await api.delete(`/comments/${id}`);
    return response.data;
  },

  /**
   * Supprime tous les commentaires associés à une tâche
   * @param {string} taskId ID de la tâche
   */
  deleteCommentsByTaskId: async (taskId) => {
    const response = await api.delete(`/comments/task/${taskId}`);
    return response.data;
  }
}; 
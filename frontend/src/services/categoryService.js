import api from './api';

/**
 * Service pour gérer les catégories
 */
export const categoryService = {
  /**
   * Récupère toutes les catégories
   * @returns {Promise<Array>} Liste des catégories
   */
  getAllCategories: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  },

  /**
   * Récupère une catégorie par son ID
   * @param {number} id ID de la catégorie
   * @returns {Promise<Object>} Catégorie
   */
  getCategoryById: async (id) => {
    try {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie ${id}:`, error);
      throw error;
    }
  },

  /**
   * Crée une nouvelle catégorie
   * @param {Object} categoryData Données de la catégorie
   * @returns {Promise<Object>} Catégorie créée
   */
  createCategory: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la catégorie:', error);
      throw error;
    }
  },

  /**
   * Met à jour une catégorie
   * @param {number} id ID de la catégorie
   * @param {Object} categoryData Nouvelles données de la catégorie
   * @returns {Promise<Object>} Catégorie mise à jour
   */
  updateCategory: async (id, categoryData) => {
    try {
      const response = await api.put(`/categories/${id}`, categoryData);
      return response.data;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de la catégorie ${id}:`, error);
      throw error;
    }
  },

  /**
   * Supprime une catégorie
   * @param {number} id ID de la catégorie
   * @returns {Promise<void>}
   */
  deleteCategory: async (id) => {
    try {
      await api.delete(`/categories/${id}`);
    } catch (error) {
      console.error(`Erreur lors de la suppression de la catégorie ${id}:`, error);
      throw error;
    }
  }
}; 
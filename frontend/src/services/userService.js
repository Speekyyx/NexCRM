import api from './api';

/**
 * Récupérer tous les utilisateurs
 * @returns {Promise<Array>} Liste des utilisateurs
 */
const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

/**
 * Récupérer un utilisateur par son ID
 * @param {number} id - ID de l'utilisateur
 * @returns {Promise<Object>} Données de l'utilisateur
 */
const getUserById = async (id) => {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de l'utilisateur ${id}:`, error);
    throw error;
  }
};

/**
 * Récupérer les utilisateurs développeurs
 * @returns {Promise<Array>} Liste des développeurs
 */
const getDeveloperUsers = async () => {
  try {
    const response = await api.get('/users/dev/list');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des développeurs:', error);
    
    // Plan B: filtrer tous les utilisateurs
    try {
      const allUsersResponse = await api.get('/users');
      return allUsersResponse.data.filter(user => user.role === 'DEVELOPPEUR');
    } catch (fallbackError) {
      console.error('Échec du plan B:', fallbackError);
      throw fallbackError;
    }
  }
};

/**
 * Récupérer les utilisateurs avec un rôle spécifique
 * @param {string} role - Rôle des utilisateurs (DEVELOPPEUR, CHEF_PROJET, CLIENT)
 * @returns {Promise<Array>} Liste des utilisateurs avec le rôle spécifié
 */
const getUsersByRole = async (role) => {
  try {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des utilisateurs avec le rôle ${role}:`, error);
    throw error;
  }
};

export const userService = {
  getAllUsers,
  getUserById,
  getDeveloperUsers,
  getUsersByRole
}; 
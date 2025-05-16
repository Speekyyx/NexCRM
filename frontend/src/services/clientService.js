import api from './api';

/**
 * Récupérer tous les clients
 * @returns {Promise<Array>} Liste des clients
 */
const getAllClients = async () => {
  try {
    const response = await api.get('/clients');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
};

/**
 * Récupérer un client par son ID
 * @param {number} id - ID du client
 * @returns {Promise<Object>} Données du client
 */
const getClientById = async (id) => {
  try {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du client ${id}:`, error);
    throw error;
  }
};

/**
 * Créer un nouveau client
 * @param {Object} clientData - Données du client à créer
 * @returns {Promise<Object>} Client créé
 */
const createClient = async (clientData) => {
  try {
    const response = await api.post('/clients', clientData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création du client:', error);
    throw error;
  }
};

/**
 * Mettre à jour un client existant
 * @param {number} id - ID du client
 * @param {Object} clientData - Nouvelles données du client
 * @returns {Promise<Object>} Client mis à jour
 */
const updateClient = async (id, clientData) => {
  try {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du client ${id}:`, error);
    throw error;
  }
};

/**
 * Supprimer un client
 * @param {number} id - ID du client à supprimer
 * @returns {Promise<boolean>} Succès de la suppression
 */
const deleteClient = async (id) => {
  try {
    await api.delete(`/clients/${id}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression du client ${id}:`, error);
    throw error;
  }
};

/**
 * Vérifier si un email est déjà utilisé par un client
 * @param {string} email - Email à vérifier
 * @returns {Promise<boolean>} True si l'email existe déjà
 */
const checkEmailExists = async (email) => {
  try {
    const response = await api.get(`/clients/check-email?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la vérification de l'email:`, error);
    throw error;
  }
};

export const clientService = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  checkEmailExists
}; 
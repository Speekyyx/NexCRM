import api from './api';

// Cache pour les tâches
const taskCache = {
  lastFetch: 0,
  data: {},
  // Temps de validité du cache en ms (1 seconde pour les tâches individuelles)
  VALIDITY: 1000,
  // Drapeau pour indiquer si une requête est en cours
  pendingRequests: {}
};

// Fonction pour invalider complètement le cache
const invalidateCache = () => {
  console.log('Invalidation du cache des tâches');
  taskCache.lastFetch = 0;
  taskCache.data = {};
};

// Fonction pour invalider une entrée spécifique du cache
const invalidateCacheEntry = (key) => {
  console.log('Invalidation de l\'entrée du cache:', key);
  delete taskCache.data[key];
};

// Fonction pour récupérer les données du cache
const getCachedData = (key) => {
  console.log('Vérification du cache pour la clé:', key);
  const now = Date.now();
  if (taskCache.data[key] && now - taskCache.lastFetch < taskCache.VALIDITY) {
    console.log('Données trouvées dans le cache:', taskCache.data[key]);
    return taskCache.data[key];
  }
  console.log('Pas de données valides dans le cache');
  return null;
};

// Fonction pour mettre à jour le cache
const updateCache = (key, data) => {
  console.log('Mise à jour du cache pour la clé:', key, 'avec les données:', data);
  taskCache.lastFetch = Date.now();
  taskCache.data[key] = data;
  return data;
};

// Fonction pour marquer une requête comme en cours
const markRequestPending = (key, isPending) => {
  taskCache.pendingRequests[key] = isPending;
};

// Fonction pour vérifier si une requête est en cours
const isRequestPending = (key) => {
  return taskCache.pendingRequests[key];
};

const getAllTasks = async () => {
  const cacheKey = 'allTasks';
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  if (isRequestPending(cacheKey)) {
    // Attendre une nouvelle tentative
    await new Promise(resolve => setTimeout(resolve, 500));
    return getAllTasks();
  }
  
  try {
    markRequestPending(cacheKey, true);
    const response = await api.get('/tasks');
    markRequestPending(cacheKey, false);
    return updateCache(cacheKey, response.data);
  } catch (error) {
    markRequestPending(cacheKey, false);
    console.error('Erreur lors de la récupération des tâches:', error);
    throw error;
  }
};

const getTaskById = async (id) => {
  const cacheKey = `task_${id}`;
  console.log('Récupération de la tâche:', id);
  
  // Vérifier si une requête est déjà en cours pour cette tâche
  if (isRequestPending(cacheKey)) {
    console.log('Une requête est déjà en cours pour cette tâche, attente...');
    await new Promise(resolve => setTimeout(resolve, 100));
    return getTaskById(id);
  }
  
  try {
    markRequestPending(cacheKey, true);
    const response = await api.get(`/tasks/${id}`);
    
    // S'assurer que les catégories sont toujours un tableau
    const taskData = {
      ...response.data,
      categories: Array.isArray(response.data.categories) ? response.data.categories : []
    };
    
    markRequestPending(cacheKey, false);
    return updateCache(cacheKey, taskData);
  } catch (error) {
    markRequestPending(cacheKey, false);
    console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
    throw error;
  }
};

const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    invalidateCache();
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    throw error;
  }
};

const updateTask = async (id, taskData) => {
  const cacheKey = `task_${id}`;
  console.log('Mise à jour de la tâche:', id);
  console.log('Données de mise à jour avant normalisation:', taskData);
  
  try {
    // S'assurer que les catégories sont correctement formatées avant l'envoi
    const normalizedTaskData = {
      ...taskData,
      categories: Array.isArray(taskData.categories) 
        ? taskData.categories.map(cat => ({
            id: cat.id,
            nom: cat.nom,
            description: cat.description
          }))
        : []
    };
    
    console.log('Données normalisées à envoyer:', normalizedTaskData);
    const response = await api.put(`/tasks/${id}`, normalizedTaskData);
    console.log('Réponse du serveur:', response.data);
    
    // S'assurer que les catégories sont correctement formatées dans la réponse
    const updatedTaskData = {
      ...response.data,
      categories: Array.isArray(response.data.categories) 
        ? response.data.categories.map(cat => ({
            id: cat.id,
            nom: cat.nom,
            description: cat.description
          }))
        : []
    };
    
    // Mettre à jour le cache avec les nouvelles données
    updateCache(cacheKey, updatedTaskData);
    invalidateCacheEntry('allTasks'); // Invalider le cache des tâches
    
    return updatedTaskData;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
    throw error;
  }
};

const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`);
    invalidateCache();
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
    throw error;
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    const response = await api.patch(`/tasks/${id}/status/${status}`);
    invalidateCache();
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la tâche ${id}:`, error);
    throw error;
  }
};

const assignTaskToUser = async (taskId, userId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/assign/${userId}`);
    invalidateCache();
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'assignation de la tâche ${taskId} à l'utilisateur ${userId}:`, error);
    throw error;
  }
};

const unassignUser = async (taskId, userId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/unassign/${userId}`);
    invalidateCache();
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la désassignation de l'utilisateur ${userId} de la tâche ${taskId}:`, error);
    throw error;
  }
};

const getTasksByStatus = async (status) => {
  const cacheKey = `tasks_status_${status}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  if (isRequestPending(cacheKey)) {
    // Attendre une nouvelle tentative
    await new Promise(resolve => setTimeout(resolve, 500));
    return getTasksByStatus(status);
  }
  
  try {
    markRequestPending(cacheKey, true);
    const response = await api.get(`/tasks/status/${status}`);
    markRequestPending(cacheKey, false);
    return updateCache(cacheKey, response.data);
  } catch (error) {
    markRequestPending(cacheKey, false);
    console.error(`Erreur lors de la récupération des tâches par statut ${status}:`, error);
    throw error;
  }
};

const getTasksByPriority = async (priority) => {
  const cacheKey = `tasks_priority_${priority}`;
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  if (isRequestPending(cacheKey)) {
    // Attendre une nouvelle tentative
    await new Promise(resolve => setTimeout(resolve, 500));
    return getTasksByPriority(priority);
  }
  
  try {
    markRequestPending(cacheKey, true);
    const response = await api.get(`/tasks/priority/${priority}`);
    markRequestPending(cacheKey, false);
    return updateCache(cacheKey, response.data);
  } catch (error) {
    markRequestPending(cacheKey, false);
    console.error(`Erreur lors de la récupération des tâches par priorité ${priority}:`, error);
    throw error;
  }
};

export const taskService = {
  getAllTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  assignTaskToUser,
  unassignUser,
  getTasksByStatus,
  getTasksByPriority,
  invalidateCache
}; 
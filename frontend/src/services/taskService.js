import api from './api';

// Cache pour les tâches
const taskCache = {
  lastFetch: 0,
  data: {},
  // Temps de validité du cache en ms (60 secondes)
  VALIDITY: 60000,
  // Drapeau pour indiquer si une requête est en cours
  pendingRequests: {}
};

// Fonction pour récupérer les données du cache
const getCachedData = (key) => {
  const now = Date.now();
  if (taskCache.data[key] && now - taskCache.lastFetch < taskCache.VALIDITY) {
    return taskCache.data[key];
  }
  return null;
};

// Fonction pour mettre à jour le cache
const updateCache = (key, data) => {
  taskCache.data[key] = data;
  taskCache.lastFetch = Date.now();
  return data;
};

// Fonction pour vérifier si une requête est en cours
const isRequestPending = (key) => {
  return taskCache.pendingRequests[key];
};

// Fonction pour marquer une requête comme en cours
const markRequestPending = (key, isPending = true) => {
  taskCache.pendingRequests[key] = isPending;
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
  const cachedData = getCachedData(cacheKey);
  
  if (cachedData) {
    return cachedData;
  }
  
  try {
    const response = await api.get(`/tasks/${id}`);
    return updateCache(cacheKey, response.data);
  } catch (error) {
    console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
    throw error;
  }
};

const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    // Invalider le cache après création
    taskCache.lastFetch = 0;
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    throw error;
  }
};

const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    // Invalider le cache après mise à jour
    taskCache.lastFetch = 0;
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
    throw error;
  }
};

const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`);
    // Invalider le cache après suppression
    taskCache.lastFetch = 0;
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
    throw error;
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    const response = await api.patch(`/tasks/${id}/status/${status}`);
    // Invalider le cache après mise à jour du statut
    taskCache.lastFetch = 0;
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la tâche ${id}:`, error);
    throw error;
  }
};

const assignTaskToUser = async (taskId, userId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/assign/${userId}`);
    // Invalider le cache après assignation
    taskCache.lastFetch = 0;
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'assignation de la tâche ${taskId} à l'utilisateur ${userId}:`, error);
    throw error;
  }
};

const unassignUser = async (taskId, userId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/unassign/${userId}`);
    // Invalider le cache après désassignation
    taskCache.lastFetch = 0;
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du retrait de l'utilisateur ${userId} de la tâche ${taskId}:`, error);
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

// Fonction pour invalider manuellement le cache
const invalidateCache = () => {
  taskCache.lastFetch = 0;
  taskCache.data = {};
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
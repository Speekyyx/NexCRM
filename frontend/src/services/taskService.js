import api from './api';

const getAllTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des tâches:', error);
    throw error;
  }
};

const getTaskById = async (id) => {
  try {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la tâche ${id}:`, error);
    throw error;
  }
};

const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la tâche:', error);
    throw error;
  }
};

const updateTask = async (id, taskData) => {
  try {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la tâche ${id}:`, error);
    throw error;
  }
};

const deleteTask = async (id) => {
  try {
    await api.delete(`/tasks/${id}`);
    return true;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la tâche ${id}:`, error);
    throw error;
  }
};

const updateTaskStatus = async (id, status) => {
  try {
    const response = await api.patch(`/tasks/${id}/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du statut de la tâche ${id}:`, error);
    throw error;
  }
};

const assignTaskToUser = async (taskId, userId) => {
  try {
    const response = await api.patch(`/tasks/${taskId}/assign/${userId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de l'assignation de la tâche ${taskId} à l'utilisateur ${userId}:`, error);
    throw error;
  }
};

const getTasksByStatus = async (status) => {
  try {
    const response = await api.get(`/tasks/status/${status}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des tâches par statut ${status}:`, error);
    throw error;
  }
};

const getTasksByPriority = async (priority) => {
  try {
    const response = await api.get(`/tasks/priority/${priority}`);
    return response.data;
  } catch (error) {
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
  getTasksByStatus,
  getTasksByPriority
}; 
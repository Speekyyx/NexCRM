import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,  // Augmentation du timeout pour éviter les erreurs prématurées
});

// Ajouter des logs pour les requêtes
api.interceptors.request.use(
  (config) => {
    console.log(`[API] Requête ${config.method?.toUpperCase() || 'GET'} vers ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('[API] Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs et les tokens expirés
api.interceptors.response.use(
  (response) => {
    console.log(`[API] Réponse de ${response.config.url} avec statut ${response.status}`);
    return response;
  },
  (error) => {
    console.error('[API] Erreur de réponse:', error.message);
    if (error.response) {
      console.error(`[API] Statut: ${error.response.status}, Données:`, error.response.data);
    }
    
    if (error.response && error.response.status === 401) {
      // Token expiré ou non valide
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api; 
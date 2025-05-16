import api from './api';

const login = async (username, password) => {
  try {
    console.log("Tentative de connexion avec:", { username });
    console.log("URL d'API utilisée:", api.defaults.baseURL);
    const response = await api.post('/auth/login', { username, password });
    console.log("Réponse de connexion:", response.data);
    const { token, user } = response.data;
    
    // Stocker les informations d'authentification
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return { success: true, user };
  } catch (error) {
    console.error("Erreur détaillée:", error);
    console.error("Réponse d'erreur:", error.response?.data);
    
    // Extraction plus précise du message d'erreur
    let errorMessage = 'Échec de la connexion';
    
    if (error.response?.data?.token && error.response.data.token.startsWith('Erreur:')) {
      // Si le serveur renvoie un message d'erreur dans le token
      errorMessage = error.response.data.token.replace('Erreur: ', '');
    } else if (error.response?.data?.message) {
      // Si le serveur renvoie un message d'erreur standard
      errorMessage = error.response.data.message;
    }
    
    return { 
      success: false, 
      message: errorMessage
    };
  }
};

const register = async (userData) => {
  try {
    console.log("Tentative d'inscription avec:", { username: userData.username });
    
    // Essayer avec plusieurs chemins possibles
    const possibleEndpoints = [
      '/auth/register',   // Relatif à /api grâce au proxy
      '/register',        // Également relatif à /api
      '/api/register',    // Chemin direct
      '/api/auth/register' // Chemin complet
    ];
    
    let response = null;
    let error = null;
    
    // Essayer chaque endpoint jusqu'à ce qu'un fonctionne
    for (const endpoint of possibleEndpoints) {
      try {
        console.log(`Tentative avec l'endpoint: ${endpoint}`);
        response = await api.post(endpoint, userData);
        
        // Si la requête réussit, sortir de la boucle
        if (response) break;
      } catch (err) {
        console.error(`Échec avec l'endpoint ${endpoint}:`, err.message);
        error = err;
        // Continuer avec l'endpoint suivant
      }
    }
    
    // Si aucun endpoint n'a fonctionné
    if (!response) {
      throw error || new Error("Tous les endpoints ont échoué");
    }
    
    console.log("Réponse d'inscription:", response.data);
    const { token, user } = response.data;
    
    // Stocker les informations d'authentification
    if (token && user) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      return { success: true, user };
    }
    
    return { success: true };
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    
    // Extraction du message d'erreur
    let errorMessage = "Échec de l'inscription";
    
    if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.response?.data?.token && error.response.data.token.startsWith('Erreur:')) {
      errorMessage = error.response.data.token.replace('Erreur: ', '');
    }
    
    return {
      success: false,
      message: errorMessage
    };
  }
};

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    return null;
  }
};

const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const authService = {
  login,
  logout,
  register,
  getCurrentUser,
  isAuthenticated
}; 
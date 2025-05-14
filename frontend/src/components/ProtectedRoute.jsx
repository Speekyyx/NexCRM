import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authService } from '../services/authService';

const ProtectedRoute = () => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas authentifié
    return <Navigate to="/login" replace />;
  }
  
  // Afficher les routes enfants
  return <Outlet />;
};

export default ProtectedRoute; 
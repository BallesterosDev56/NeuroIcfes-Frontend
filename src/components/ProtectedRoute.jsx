import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { userProfile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!userProfile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && userProfile.role !== 'admin') {
    // Lanzar un error que será capturado por el ErrorBoundary
    throw {
      status: 403,
      statusText: 'Acceso denegado: Se requieren permisos de administrador'
    };
  }

  return children;
};
import React from 'react';
import { useRouteError, Link, useNavigate } from 'react-router-dom';
import { BrainCircuit, Home, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleBack = () => {
    if (user?.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/home');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50"></div>
          {error.status === 403 ? (
            <ShieldAlert className="h-32 w-32 mx-auto text-red-600 relative z-10" />
          ) : (
            <BrainCircuit className="h-32 w-32 mx-auto text-indigo-600 relative z-10" />
          )}
        </div>
        
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            {error.status === 404 
              ? 'Página no encontrada' 
              : error.status === 403 
                ? 'Acceso denegado'
                : '¡Ups! Algo salió mal'}
          </h1>
          
          <p className="text-gray-600 text-lg">
            {error.status === 404 
              ? 'La página que estás buscando no existe o ha sido movida.'
              : error.status === 403
                ? 'No tienes permisos para acceder a esta página.'
                : 'Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde.'}
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleBack}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Volver
          </button>
          
          <button
            onClick={() => window.location.reload()}
            className="block w-full text-indigo-600 hover:text-indigo-500 font-medium"
          >
            Intentar de nuevo
          </button>
        </div>
      </div>
    </div>
  );
}; 
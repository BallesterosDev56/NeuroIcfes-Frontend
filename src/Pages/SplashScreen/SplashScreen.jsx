import React, { useEffect, useState } from 'react';
import Logo from '../../assets/images/logo.png';
import { useNavigate } from 'react-router-dom';

export const SplashScreen = () => {

    const navigate = useNavigate();
  
  useEffect(() => {
    // Cambiar a la siguiente pagina
    const timer = setTimeout(() => {
      navigate('/introduction');
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex flex-col justify-center items-center z-50 bg-gradient-to-br from-blue-50 via-indigo-100 to-blue-200 overflow-hidden">
      {/* Círculos decorativos con opacidad */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      
        <div className="relative">
          {/* Efecto de brillo detrás del logo */}
          <div className="absolute inset-0 bg-blue-400 rounded-full filter blur-md opacity-30 scale-110"></div>
          
          {/* Logo */}
          <img 
            src={Logo} 
            alt="Logo" 
            className="w-14 h-12 sm:w-18 sm:h-16 relative z-10 mb-4" 
          />
        </div>
        
        {/* Título con efecto de sombra */}
        <h1 className="text-3xl sm:text-2xl font-bold text-center text-[#2B3ED1] tracking-wide">
          NeuroICFES AI
        </h1>
        

        
        {/* Indicador de carga */}
        <div className="mt-6 flex space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce"></div>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-150"></div>
          <div className="w-2 h-2 rounded-full bg-blue-600 animate-bounce delay-300"></div>
        </div>
    </div>
  );
};
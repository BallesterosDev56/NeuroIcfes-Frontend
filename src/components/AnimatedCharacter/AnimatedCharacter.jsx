import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

// Este componente será reemplazado por Lottie en producción
const EmotionPlaceholder = ({ emotion }) => {
  const emotionMap = {
    idle: { emoji: '😊', color: 'text-indigo-500' },
    thinking: { emoji: '🤔', color: 'text-indigo-500 animate-pulse' },
    correct: { emoji: '😄', color: 'text-green-500' },
    incorrect: { emoji: '😔', color: 'text-red-500' },
    celebration: { emoji: '🎉', color: 'text-yellow-500' },
    confused: { emoji: '😕', color: 'text-orange-500' },
  };

  const { emoji, color } = emotionMap[emotion] || emotionMap.idle;

  return <div className={`text-4xl md:text-5xl ${color}`}>{emoji}</div>;
};

const AnimatedCharacter = ({ 
  state = 'idle', 
  message = '¡Estoy aquí para ayudarte!',
  stats = {
    streak: 2,
    level: 2,
    subject: 'Ciencias'
  },
  className = '',
  position = 'bottom'
}) => {
  // Estado para animación de entrada
  const [isVisible, setIsVisible] = useState(false);
  
  // Efecto para animar entrada cuando cambia el estado
  useEffect(() => {
    setIsVisible(false);
    
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [state]);

  return (
    <div 
      className={`flex transition-all duration-300 ${className}
      ${position === 'floating-right' ? 
        'fixed bottom-6 right-6 z-50' : 
        position === 'floating-left' ? 
        'fixed bottom-6 left-6 z-50' : ''}
      ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Contenedor principal */}
      <div className="bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-xl overflow-hidden border border-indigo-100/50 p-4 md:p-6 w-full">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-3">
          <div className="text-xs font-medium text-indigo-800">
            <span className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-sm">Tutor ICFES</span>
          </div>
        </div>

        {/* Contenido */}
        <div className="flex items-start gap-4 md:gap-5">
          {/* Avatar */}
          <div className="bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-full flex items-center justify-center shadow-inner w-16 h-16 md:w-20 md:h-20 min-w-16 md:min-w-20">
            <EmotionPlaceholder emotion={state} />
          </div>

          {/* Mensaje y estadísticas */}
          <div className="flex-1 min-w-0">
            {/* Mensaje */}
            <div className="bg-white/80 backdrop-blur-sm p-3 md:p-4 rounded-xl w-full mb-3 md:mb-4 shadow-sm border border-indigo-100/50">
              <p className="text-sm text-gray-700 whitespace-normal break-words leading-relaxed">{message}</p>
            </div>
            
            {/* Estadísticas */}
            <div className="w-full">
              <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                <span className="font-medium">Racha actual</span>
                <span className="font-semibold text-indigo-600">{stats.streak}/5</span>
              </div>
              <div className="flex gap-1.5 mb-3 md:mb-4">
                {[...Array(5)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`h-1.5 md:h-2 rounded-full flex-1 transition-all duration-300
                      ${index < stats.streak ? 'bg-gradient-to-r from-indigo-500 to-indigo-600' : 'bg-gray-200'}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AnimatedCharacter.propTypes = {
  state: PropTypes.oneOf(['idle', 'thinking', 'correct', 'incorrect', 'celebration', 'confused']),
  message: PropTypes.string,
  stats: PropTypes.shape({
    streak: PropTypes.number,
    level: PropTypes.number,
    subject: PropTypes.string
  }),
  className: PropTypes.string,
  position: PropTypes.oneOf(['normal', 'floating-right', 'floating-left', 'bottom'])
};

export default AnimatedCharacter;
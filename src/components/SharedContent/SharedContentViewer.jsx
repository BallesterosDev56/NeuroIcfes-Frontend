import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Componente para visualizar contenido compartido (textos largos e imágenes)
 */
const SharedContentViewer = ({ sharedContent, currentQuestionNumber = 1, totalQuestions = 1 }) => {
  const [activeElementId, setActiveElementId] = useState(null);
  const [elementInfo, setElementInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const { getImageElementInfo } = useApp();
  
  if (!sharedContent) return null;

  const handleElementClick = async (elementId) => {
    if (activeElementId === elementId) {
      setActiveElementId(null);
      setElementInfo(null);
      return;
    }
    
    setActiveElementId(elementId);
    setLoading(true);
    
    try {
      const info = await getImageElementInfo(sharedContent._id, elementId);
      setElementInfo(info);
    } catch (error) {
      console.error('Error obteniendo información del elemento:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Renderizar el tipo de contenido adecuado
  const renderContent = () => {
    switch (sharedContent.contentType) {
      case 'text':
        return renderTextContent();
      case 'image':
        return renderImageContent();
      case 'graph':
        return renderGraphContent();
      case 'mixed':
        return renderMixedContent();
      default:
        return <p>Tipo de contenido no soportado</p>;
    }
  };
  
  // Contenido de texto
  const renderTextContent = () => (
    <div className="prose max-w-none p-2 sm:p-3">
      <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">
        {sharedContent.title}
      </h3>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-xs sm:text-sm text-gray-800 whitespace-pre-line max-h-[250px] sm:max-h-[300px] overflow-y-auto custom-scrollbar p-2 sm:p-3 leading-relaxed">
          {sharedContent.textContent}
        </div>
      </div>
    </div>
  );
  
  // Contenido de imagen
  const renderImageContent = () => (
    <div className="p-2 sm:p-3">
      <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">
        {sharedContent.title}
      </h3>
      <div className="relative mb-2 sm:mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <img 
          src={sharedContent.mediaUrl} 
          alt={sharedContent.title}
          className="w-full h-auto max-h-[300px] sm:max-h-[400px] object-contain mx-auto" 
        />
        
        {/* Puntos interactivos para los elementos de la imagen */}
        {sharedContent.imageElements?.map(el => (
          <button 
            key={el.elementId}
            className={`absolute bg-indigo-500 ${activeElementId === el.elementId ? 'bg-opacity-80' : 'bg-opacity-50'} hover:bg-opacity-70 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white text-xs sm:text-sm font-bold transition-all duration-200 transform hover:scale-110`}
            style={{ 
              top: el.coordinates?.includes('superior') ? '10%' : el.coordinates?.includes('centro') ? '50%' : '80%',
              left: el.coordinates?.includes('izquierda') ? '20%' : el.coordinates?.includes('centro') ? '50%' : '80%',
              transform: 'translate(-50%, -50%)'
            }}
            onClick={() => handleElementClick(el.elementId)}
          >
            {el.elementId}
          </button>
        ))}
      </div>
    </div>
  );
  
  // Contenido de gráficas
  const renderGraphContent = () => {
    // Similar a renderImageContent pero con etiquetas específicas para gráficas
    return renderImageContent();
  };
  
  // Contenido mixto
  const renderMixedContent = () => (
    <div className="p-2 sm:p-3">
      <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2">
        {sharedContent.title}
      </h3>
      
      {/* Texto */}
      {sharedContent.textContent && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-2 sm:mb-3">
          <div className="prose max-w-none text-xs sm:text-sm text-gray-800 whitespace-pre-line max-h-[150px] sm:max-h-[200px] overflow-y-auto custom-scrollbar p-2 sm:p-3 leading-relaxed">
            {sharedContent.textContent}
          </div>
        </div>
      )}
      
      {/* Imagen */}
      {sharedContent.mediaUrl && (
        <div className="relative mb-2 sm:mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <img 
            src={sharedContent.mediaUrl} 
            alt={sharedContent.title}
            className="w-full h-auto max-h-[250px] sm:max-h-[300px] object-contain mx-auto" 
          />
          
          {/* Puntos interactivos */}
          {sharedContent.imageElements?.map(el => (
            <button 
              key={el.elementId}
              className={`absolute bg-indigo-500 ${activeElementId === el.elementId ? 'bg-opacity-80' : 'bg-opacity-50'} hover:bg-opacity-70 rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center text-white text-xs sm:text-sm font-bold transition-all duration-200 transform hover:scale-110`}
              style={{ 
                top: el.coordinates?.includes('superior') ? '10%' : el.coordinates?.includes('centro') ? '50%' : '80%',
                left: el.coordinates?.includes('izquierda') ? '20%' : el.coordinates?.includes('centro') ? '50%' : '80%',
                transform: 'translate(-50%, -50%)'
              }}
              onClick={() => handleElementClick(el.elementId)}
            >
              {el.elementId}
            </button>
          ))}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="shared-content-viewer">
      {renderContent()}
      
      {/* Indicador de progreso */}
      <div className="px-2 sm:px-3 py-2 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs space-y-1 sm:space-y-0 border-t border-gray-100 bg-gray-50">
        <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md font-medium">
          Pregunta {currentQuestionNumber} de {totalQuestions}
        </span>
        
        <span className="text-gray-500">
          {sharedContent.subject && (
            <span className="capitalize">{sharedContent.subject}</span>
          )}
          {sharedContent.subject && sharedContent.difficulty && (
            <span className="mx-1">•</span>
          )}
          {sharedContent.difficulty && (
            <span className="capitalize">{sharedContent.difficulty}</span>
          )}
        </span>
      </div>
      
      <style jsx global>{`
        .shared-content-viewer {
          display: flex;
          flex-direction: column;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f5f9;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default SharedContentViewer; 
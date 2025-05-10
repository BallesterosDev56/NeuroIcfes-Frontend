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
    <div className="prose max-w-none p-3">
      <h3 className="text-base font-medium text-gray-900 mb-2">{sharedContent.title}</h3>
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="text-gray-800 whitespace-pre-line text-sm max-h-[300px] overflow-y-auto custom-scrollbar p-3 leading-relaxed">
          {sharedContent.textContent}
        </div>
      </div>
    </div>
  );
  
  // Contenido de imagen
  const renderImageContent = () => (
    <div className="p-3">
      <h3 className="text-base font-medium text-gray-900 mb-2">{sharedContent.title}</h3>
      <div className="relative mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <img 
          src={sharedContent.mediaUrl} 
          alt={sharedContent.title}
          className="max-w-full mx-auto" 
        />
        
        {/* Puntos interactivos para los elementos de la imagen */}
        {sharedContent.imageElements?.map(el => (
          <button 
            key={el.elementId}
            className={`absolute bg-indigo-500 ${activeElementId === el.elementId ? 'bg-opacity-80' : 'bg-opacity-50'} hover:bg-opacity-70 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold transition-all duration-200 transform hover:scale-110`}
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
      
      {/* Información de elementos seleccionados */}
      {activeElementId && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
          <h4 className="font-medium text-indigo-900 mb-1 flex items-center text-sm">
            <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs mr-1">{activeElementId}</span>
            Elemento {activeElementId}
          </h4>
          {loading ? (
            <div className="flex justify-center py-1">
              <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              <p className="text-gray-700 text-xs">{elementInfo?.element?.description}</p>
              {elementInfo?.explanation && (
                <div className="mt-1 text-xs bg-white p-2 rounded-md border border-indigo-100">
                  {elementInfo.explanation}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
  
  // Contenido de gráficas
  const renderGraphContent = () => {
    // Similar a renderImageContent pero con etiquetas específicas para gráficas
    return renderImageContent();
  };
  
  // Contenido mixto (imagen + texto)
  const renderMixedContent = () => (
    <div className="p-3">
      <h3 className="text-base font-medium text-gray-900 mb-2">{sharedContent.title}</h3>
      
      {/* Texto */}
      {sharedContent.textContent && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-3">
          <div className="prose max-w-none text-gray-800 whitespace-pre-line text-sm max-h-[200px] overflow-y-auto custom-scrollbar p-3 leading-relaxed">
            {sharedContent.textContent}
          </div>
        </div>
      )}
      
      {/* Imagen */}
      {sharedContent.mediaUrl && (
        <div className="relative mb-3 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          <img 
            src={sharedContent.mediaUrl} 
            alt={sharedContent.title}
            className="max-w-full mx-auto" 
          />
          
          {/* Puntos interactivos */}
          {sharedContent.imageElements?.map(el => (
            <button 
              key={el.elementId}
              className={`absolute bg-indigo-500 ${activeElementId === el.elementId ? 'bg-opacity-80' : 'bg-opacity-50'} hover:bg-opacity-70 rounded-full w-5 h-5 flex items-center justify-center text-white font-bold transition-all duration-200 transform hover:scale-110`}
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
      
      {/* Información de elementos seleccionados */}
      {activeElementId && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-lg border border-indigo-100">
          <h4 className="font-medium text-indigo-900 mb-1 flex items-center text-sm">
            <span className="w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center text-white text-xs mr-1">{activeElementId}</span>
            Elemento {activeElementId}
          </h4>
          {loading ? (
            <div className="flex justify-center py-1">
              <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <>
              <p className="text-gray-700 text-xs">{elementInfo?.element?.description}</p>
              {elementInfo?.explanation && (
                <div className="mt-1 text-xs bg-white p-2 rounded-md border border-indigo-100">
                  {elementInfo.explanation}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
  
  return (
    <div className="shared-content-viewer">
      {renderContent()}
      
      {/* Indicador de progreso */}
      <div className="px-3 py-2 flex justify-between items-center text-xs border-t border-gray-100 bg-gray-50">
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
          width: 6px;
          height: 6px;
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
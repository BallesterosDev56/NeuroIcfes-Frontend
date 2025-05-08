import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Trash2,
  AlertTriangle,
  Book,
  Clock,
  CheckCircle,
  XCircle,
  Filter
} from 'lucide-react';
import progressService from '../../services/progressService';

/**
 * Componente para visualizar y gestionar las preguntas contestadas por el usuario
 */
const AnsweredQuestions = () => {
  const { progress, fetchProgress } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Si no hay progreso, mostrar mensaje
  if (!progress || !progress.answeredQuestions || progress.answeredQuestions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex flex-col items-center mb-4">
          <Book className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No has respondido preguntas aún</h3>
          <p className="text-gray-500 mt-2">
            Cuando respondas preguntas, aquí podrás ver tu historial.
          </p>
        </div>
      </div>
    );
  }

  // Filtrar preguntas por materia
  const filteredQuestions = selectedSubject === 'all'
    ? progress.answeredQuestions
    : progress.answeredQuestions.filter(q => q.subject === selectedSubject);

  // Lista de materias disponibles
  const subjectsList = [...new Set(progress.answeredQuestions.map(q => q.subject))];

  // Obtener estadísticas de preguntas respondidas
  const stats = {
    total: filteredQuestions.length,
    correct: filteredQuestions.filter(q => q.isCorrect).length,
    avgTime: Math.round(filteredQuestions.reduce((sum, q) => sum + q.timeSpent, 0) / filteredQuestions.length / 1000)
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString().substring(0, 5);
  };

  // Función para formatear tiempo
  const formatTime = (timeMs) => {
    const seconds = Math.floor(timeMs / 1000);
    if (seconds < 60) {
      return `${seconds} seg`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  // Manejar el evento para reiniciar el progreso
  const handleResetProgress = async () => {
    try {
      setIsLoading(true);
      
      // Llamar a la API para reiniciar el progreso
      await progressService.resetProgress();
      
      // Actualizar progreso después de reiniciarlo
      await fetchProgress();
      
      setShowConfirmReset(false);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
    } catch (error) {
      console.error('Error resetting progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Cabecera con filtros y estadísticas */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
            Preguntas Respondidas
          </h3>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="text-sm bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 pr-8 appearance-none"
              >
                <option value="all">Todas las materias</option>
                {subjectsList.map(subject => (
                  <option key={subject} value={subject} className="capitalize">
                    {subject}
                  </option>
                ))}
              </select>
              <Filter size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none" />
            </div>
            
            <button
              onClick={() => setShowConfirmReset(true)}
              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full"
              title="Reiniciar progreso"
            >
              <Trash2 size={18} />
            </button>
          </div>
        </div>
        
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-4 mb-2">
          <div className="bg-indigo-50 rounded-lg p-3">
            <div className="text-xs text-indigo-600 mb-1">Total respondidas</div>
            <div className="text-lg font-semibold text-indigo-800">{stats.total}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-xs text-green-600 mb-1">Correctas</div>
            <div className="text-lg font-semibold text-green-800">
              {stats.correct} ({Math.round(stats.correct / stats.total * 100)}%)
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="text-xs text-blue-600 mb-1">Tiempo promedio</div>
            <div className="text-lg font-semibold text-blue-800">{stats.avgTime} seg</div>
          </div>
        </div>
      </div>
      
      {/* Lista de preguntas respondidas */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Materia
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tiempo
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredQuestions.slice(0, 20).map((question, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  {question.isCorrect ? (
                    <div className="flex items-center">
                      <CheckCircle size={16} className="text-green-500 mr-1" />
                      <span className="text-sm text-green-700">Correcta</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <XCircle size={16} className="text-red-500 mr-1" />
                      <span className="text-sm text-red-700">Incorrecta</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-900 capitalize">{question.subject}</span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <Clock size={14} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-500">{formatDate(question.answeredAt)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className="text-sm text-gray-500">{formatTime(question.timeSpent)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredQuestions.length > 20 && (
          <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-500">
            Mostrando 20 de {filteredQuestions.length} preguntas
          </div>
        )}
      </div>
      
      {/* Modal de confirmación para reiniciar progreso */}
      {showConfirmReset && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle size={24} className="text-red-600" />
              </div>
              <h3 className="ml-3 text-lg font-medium text-gray-900">
                ¿Reiniciar progreso de preguntas?
              </h3>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Esta acción eliminará todas las preguntas respondidas y permitirá que aparezcan de nuevo en tu práctica. 
              Esta acción no puede deshacerse.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <button
                onClick={handleResetProgress}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 flex items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Procesando...
                  </>
                ) : (
                  'Reiniciar progreso'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md z-50">
          <div className="flex">
            <CheckCircle size={20} className="mr-2" />
            <div>Progreso reiniciado correctamente</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnsweredQuestions; 
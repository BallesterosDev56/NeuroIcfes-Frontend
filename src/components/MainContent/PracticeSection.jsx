import React, { useState } from 'react';
import { BrainCircuit } from 'lucide-react';

const PracticeSection = () => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    setShowFeedback(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BrainCircuit className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Práctica</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">
            Pregunta de práctica
          </h2>
          <p className="text-gray-700">
            En un experimento de laboratorio, se observa que una sustancia cambia de color al agregar un indicador ácido-base. Este cambio de color indica que:
          </p>
        </div>

        <div className="space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => (
            <button
              key={option}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full p-4 text-left rounded-lg border transition-colors ${
                selectedAnswer === option
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <span className="font-medium text-gray-900">
                {option}. {option === 'A' ? 'La sustancia es ácida' :
                         option === 'B' ? 'La sustancia es básica' :
                         option === 'C' ? 'La sustancia es neutra' :
                         'El indicador no es adecuado para esta sustancia'}
              </span>
            </button>
          ))}
        </div>

        {showFeedback && (
          <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
            <h3 className="font-medium text-indigo-900 mb-2">Retroalimentación del Tutor</h3>
            <p className="text-indigo-700">
              {selectedAnswer === 'A' 
                ? '¡Correcto! El cambio de color indica que la sustancia es ácida.'
                : 'Incorrecto. El cambio de color en un indicador ácido-base indica que la sustancia es ácida.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PracticeSection; 
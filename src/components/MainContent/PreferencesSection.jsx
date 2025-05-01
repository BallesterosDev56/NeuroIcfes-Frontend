
import { User } from 'lucide-react';

const PreferencesSection = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <User className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Preferencias</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Materias de práctica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Ciencias Naturales', 'Lectura Crítica', 'Matemáticas', 'Sociales'].map((subject) => (
              <label key={subject} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">{subject}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Nivel de dificultad</h2>
          <div className="space-y-3">
            {['Básico', 'Intermedio', 'Avanzado'].map((level) => (
              <label key={level} className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input type="radio" name="difficulty" className="form-radio h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">{level}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Preferencias de estudio</h2>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" />
              <span className="text-gray-700">Recibir recordatorios diarios</span>
            </label>
            <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input type="checkbox" className="form-checkbox h-5 w-5 text-indigo-600" />
              <span className="text-gray-700">Mostrar explicaciones detalladas</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreferencesSection; 
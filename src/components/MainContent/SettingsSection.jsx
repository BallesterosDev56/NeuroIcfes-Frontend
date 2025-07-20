
import { Settings } from 'lucide-react';

const SettingsSection = () => {
  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-center space-x-3">
        <Settings className="text-indigo-600" size={24} />
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Ajustes</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Perfil</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo
              </label>
              <input
                type="text"
                className="w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                placeholder="Tu nombre"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                className="w-full p-2.5 sm:p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
                placeholder="tu@email.com"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Notificaciones</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="text-gray-700">Notificaciones por correo</span>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out"></div>
              </div>
            </label>
            <label className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
              <span className="text-gray-700">Recordatorios de práctica</span>
              <div className="relative inline-block w-12 h-6 transition duration-200 ease-in-out rounded-full">
                <input type="checkbox" className="sr-only" />
                <div className="w-12 h-6 bg-gray-200 rounded-full shadow-inner"></div>
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out"></div>
              </div>
            </label>
          </div>
        </div>

        <div className="pt-4">
          <button className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors">
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsSection; 
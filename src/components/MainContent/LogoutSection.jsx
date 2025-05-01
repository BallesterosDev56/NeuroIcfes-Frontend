
import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase/auth';
import { signOut } from 'firebase/auth';

const LogoutSection = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // sessionStorage will be cleared in AuthContext
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <LogOut className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Cerrar Sesión</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        <div className="text-center space-y-4">
          <p className="text-gray-700">
            ¿Estás seguro que deseas cerrar tu sesión? Podrás volver a iniciar sesión en cualquier momento.
          </p>
          <button 
            onClick={handleLogout}
            className="w-full py-3 px-4 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutSection; 
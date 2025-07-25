import Logo from '../../assets/images/logo.png';
import { 
  BookOpen, 
  Settings, 
  User, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  BrainCircuit,
  Home,
  BarChart2,
  BookMarked,
  GraduationCap
} from 'lucide-react';

export const Sidebar = ({ activeSection, onSectionChange, isOpen, onToggle }) => {
  const userData = JSON.parse(sessionStorage.getItem('userData'));
  const menuItems = [
    { id: 'practice', label: 'Práctica', icon: BookOpen },
    //{ id: 'progress', label: 'Progreso', icon: BarChart2 },
    { id: 'preferences', label: 'Preferencias', icon: User },
    { id: 'settings', label: 'Ajustes', icon: Settings },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-40 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'w-72' : 'w-20'
        } ${!isOpen && '!w-0 lg:!w-20'}`}
      >
        <div className="h-full flex flex-col relative">
          {/* Toggle Button */}
          <button
            className="absolute -right-3 top-6 z-50 p-1.5 rounded-full bg-white shadow-lg hover:bg-gray-50 transition-all border border-gray-100 hidden lg:flex items-center justify-center"
            onClick={onToggle}
          >
            {isOpen ? <ChevronLeft size={16} className="text-gray-700" /> : <ChevronRight size={16} className="text-gray-700" />}
          </button>

          {/* Mobile menu button */}
          <button
            className="lg:hidden absolute top-4 right-4 z-50 p-2.5 rounded-xl bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white transition-all border border-gray-100"
            onClick={onToggle}
          >
            {isOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
          </button>

          {/* Logo and Title */}
          <div className={`p-6 transition-opacity duration-200 ${!isOpen ? 'lg:opacity-0' : 'opacity-100'} ${!isOpen && 'lg:hidden'}`}>
            <div className="flex items-center space-x-3">
              <img className='w-16' src={Logo} alt="Logo" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                NeuroICFES AI
              </h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={`w-full flex items-center ${isOpen ? 'justify-start' : 'lg:justify-center'} space-x-3 px-4 py-3 rounded-xl transition-all ${
                    activeSection === item.id
                      ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50/50'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${activeSection === item.id ? 'bg-indigo-100' : 'bg-gray-100'}`}>
                    <Icon size={20} className={activeSection === item.id ? 'text-indigo-600' : 'text-gray-500'} />
                  </div>
                  <span className={`font-medium transition-opacity duration-200 ${!isOpen ? 'lg:opacity-0 lg:w-0' : 'opacity-100'} ${!isOpen && 'lg:hidden'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className={`p-4 transition-opacity duration-200 ${!isOpen ? 'lg:opacity-0' : 'opacity-100'} ${!isOpen && 'lg:hidden'}`}>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent" />
            <div className="mt-4 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userData?.displayName}</p>
                <p className="text-xs text-gray-500">Estudiante</p>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4">
            <button
              onClick={() => onSectionChange('logout')}
              className={`w-full flex items-center ${isOpen ? 'justify-start' : 'lg:justify-center'} space-x-3 px-4 py-3 rounded-xl transition-all ${
                activeSection === 'logout'
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50/50'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${activeSection === 'logout' ? 'bg-red-100' : 'bg-gray-100'}`}>
                <LogOut size={20} className={activeSection === 'logout' ? 'text-red-600' : 'text-gray-500'} />
              </div>
              <span className={`font-medium transition-opacity duration-200 ${!isOpen ? 'lg:opacity-0 lg:w-0' : 'opacity-100'} ${!isOpen && 'lg:hidden'}`}>
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={onToggle}
        />
      )}
    </>
  );
};
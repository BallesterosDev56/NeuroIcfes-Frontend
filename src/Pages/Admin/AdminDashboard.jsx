import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { AppProvider } from '../../context/AppContext';
import { BrainCircuit, BookOpen, LogOut, Layers } from 'lucide-react';
import QuestionDashboard from '../../components/Admin/QuestionDashboard';
import SharedContentDashboard from '../../components/Admin/SharedContentDashboard';
import { getAllUsers } from '../../services/userService';
import { questionService } from '../../services/questionService';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { userProfile } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [userCount, setUserCount] = useState(0);
  const [activeSessions, setActiveSessions] = useState(0);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const users = await getAllUsers();
        setUserCount(users.length);
        // Count active sessions (users who have logged in within the last 30 minutes)
        const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
        const active = users.filter(user => new Date(user.lastLogin) > thirtyMinutesAgo).length;
        setActiveSessions(active);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    const fetchQuestionCount = async () => {
      try {
        const count = await questionService.getQuestionsCount();
        setQuestionCount(count);
      } catch (error) {
        console.error('Error fetching question count:', error);
      }
    };

    fetchUserCount();
    fetchQuestionCount();
    // Refresh every 5 minutes
    const interval = setInterval(() => {
      fetchUserCount();
      fetchQuestionCount();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    // Implementar lógica de logout
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'questions':
        return <QuestionDashboard />;
      case 'sharedContent':
        return <SharedContentDashboard />;
      case 'dashboard':
      default:
        return (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
              <p className="mt-2 text-gray-600">Bienvenido, {userProfile?.displayName}</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                    <p className="text-2xl font-semibold text-gray-900">{userCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-green-100 text-green-600">
                    <BookOpen className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Preguntas</p>
                    <p className="text-2xl font-semibold text-gray-900">{questionCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                    <BrainCircuit className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Sesiones Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">{activeSessions}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actividad Reciente</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-600">No hay actividad reciente para mostrar.</p>
              </div>
            </div>
          </>
        );
    }
  };

  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="fixed inset-y-0 left-0 w-64 bg-blue-600 text-white">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-center h-16 px-4 bg-blue-700">
              <BrainCircuit className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold">NeuroICFES Admin</span>
            </div>
            
            <nav className="flex-1 px-4 py-4 space-y-2">
              <button
                onClick={() => setActiveSection('dashboard')}
                className={`flex items-center w-full px-4 py-2 text-white rounded-lg ${
                  activeSection === 'dashboard' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <BrainCircuit className="h-5 w-5 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveSection('questions')}
                className={`flex items-center w-full px-4 py-2 text-white rounded-lg ${
                  activeSection === 'questions' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <BookOpen className="h-5 w-5 mr-3" />
                Preguntas
              </button>
              <button
                onClick={() => setActiveSection('sharedContent')}
                className={`flex items-center w-full px-4 py-2 text-white rounded-lg ${
                  activeSection === 'sharedContent' ? 'bg-blue-700' : 'hover:bg-blue-700'
                }`}
              >
                <Layers className="h-5 w-5 mr-3" />
                Contenido Compartido
              </button>
            </nav>

            <div className="p-4 border-t border-blue-700">
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-4 py-2 text-white hover:bg-blue-700 rounded-lg"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="ml-64 p-8">
          {renderContent()}
        </div>
      </div>
    </AppProvider>
  );
}; 
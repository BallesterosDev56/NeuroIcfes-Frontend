import React, { useState, useEffect } from 'react';
import Bot from '../../assets/images/bot.png'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2, ChevronRight } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: '¿En qué grado estás?',
    options: ['9°', '10°', '11°'],
    field: 'grade'
  },
  {
    id: 2,
    question: '¿Qué materia quieres estudiar hoy?',
    options: ['Ciencias Naturales', 'Lectura Crítica'],
    field: 'subject'
  },
  {
    id: 3,
    question: '¿Tienes experiencia previa con el ICFES?',
    options: ['Sí', 'No'],
    field: 'hasExperience'
  }
];

// Mensajes para el spinner de carga
const loadingMessages = [
  "Estamos preparando todo para ti...",
  "Ajustando la plataforma a tus intereses...",
  "Personalizando tu experiencia de aprendizaje..."
];

export const UserInfo = () => {
  const navigate = useNavigate();
  const { currentUser, setUserProfile } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [updatedProfile, setUpdatedProfile] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    let value = answer;

    // Convertir "Sí" y "No" a booleanos para el campo hasExperience
    if (currentQuestion.field === 'hasExperience') {
      value = answer === 'Sí';
    }

    setAnswers(prev => ({
      ...prev,
      [currentQuestion.field]: value
    }));
    setSelectedOption(answer);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      // Primero actualizamos el perfil del usuario
      const updatedProfile = {
        ...answers,
        profileCompleted: true
      };
      await updateUserProfile(currentUser.uid, updatedProfile);

      setUpdatedProfile(updatedProfile);
      
      // Mostrar el spinner y activar la redirección programada
      setShowLoader(true);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      setIsSubmitting(false);
    }
  };

  // Efecto para cambiar los mensajes del spinner cada segundo
  useEffect(() => {
    let interval;
    
    if (showLoader) {
      setLoadingMessage(loadingMessages[0]);
      let currentIndex = 0;
      
      interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % loadingMessages.length;
        setLoadingMessage(loadingMessages[currentIndex]);
      }, 1000);
      
      // Timer para redirigir después de 3 segundos
      const redirectTimer = setTimeout(() => {
        // Actualizar el estado del perfil en el contexto de autenticación para que UserInfoRoute lo redirija
        setUserProfile(updatedProfile);
      }, 3000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(redirectTimer);
      };
    }
  }, [showLoader, navigate]);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <motion.div
            className="bg-indigo-600 h-2.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <div className="text-center">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-50"></div>
              <img 
                src={Bot} 
                alt="Bot" 
                className="w-32 h-32 object-contain relative z-10"
              />
            </div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2"
          >
            ¡Completemos tu perfil!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600 text-lg"
          >
            Ayúdanos a conocerte mejor para personalizar tu experiencia
          </motion.p>
        </div>

        {showLoader ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
          >
            <div className="relative">
              <Loader2 className="animate-spin mx-auto h-16 w-16 text-indigo-600" />
              <div className="absolute inset-0 bg-indigo-200 rounded-full blur-xl opacity-30"></div>
            </div>
            <p className="text-gray-700 text-lg font-medium">{loadingMessage}</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestionIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  {currentQuestion.question}
                </h2>
                <div className="space-y-4">
                  {currentQuestion.options.map((option) => (
                    <motion.button
                      key={option}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: currentQuestion.options.indexOf(option) * 0.1 }}
                      onClick={() => handleAnswer(option)}
                      className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 flex items-center justify-between group ${
                        selectedOption === option
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                          : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50 hover:shadow-md'
                      }`}
                    >
                      <span className="text-lg font-medium">{option}</span>
                      <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${
                        selectedOption === option ? 'text-indigo-600 transform translate-x-1' : 'text-gray-400 group-hover:text-indigo-600'
                      }`} />
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            {currentQuestionIndex === questions.length - 1 && selectedOption && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="animate-spin h-5 w-5" />
                    <span>Guardando...</span>
                  </div>
                ) : (
                  'Finalizar'
                )}
              </motion.button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
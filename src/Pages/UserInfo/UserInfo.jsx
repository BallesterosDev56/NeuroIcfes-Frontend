import React, { useState, useEffect } from 'react';
import Bot from '../../assets/images/bot.png'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/userService';
import { motion, AnimatePresence } from 'framer-motion';
import { BrainCircuit, Loader2 } from 'lucide-react';

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
  const [messageIndex, setMessageIndex] = useState(0);

  const handleAnswer = (answer) => {
    const currentQuestion = questions[currentQuestionIndex];
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.field]: answer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
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
      
      // Actualizar el estado del perfil en el contexto de autenticación
      setUserProfile(updatedProfile);
      
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
        navigate('/home');
      }, 3000);
      
      return () => {
        clearInterval(interval);
        clearTimeout(redirectTimer);
      };
    }
  }, [showLoader, navigate]);

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <img 
              src={Bot} 
              alt="Bot" 
              className="w-32 h-32 object-contain"
            />
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-3xl font-bold text-gray-900 mb-2"
          >
            ¡Completemos tu perfil!
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-gray-600"
          >
            Ayúdanos a conocerte mejor para personalizar tu experiencia
          </motion.p>
        </div>

        <AnimatePresence mode="wait">
          {showLoader ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-8 space-y-6 flex flex-col items-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 size={48} className="text-indigo-600" />
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMessage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="text-lg font-medium text-indigo-700 text-center"
                >
                  {loadingMessage}
                </motion.p>
              </AnimatePresence>
            </motion.div>
          ) : (
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-xl shadow-lg p-6 space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 text-center">
                {currentQuestion.question}
              </h2>

              <div className="grid gap-4">
                {currentQuestion.options.map((option) => (
                  <motion.button
                    key={option}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAnswer(option)}
                    className="w-full py-3 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-medium transition-colors"
                  >
                    {option}
                  </motion.button>
                ))}
              </div>

              {currentQuestionIndex === questions.length - 1 && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Guardando...' : '¡Empecemos!'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!showLoader && (
          <div className="flex justify-center space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === currentQuestionIndex
                    ? 'bg-indigo-600'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
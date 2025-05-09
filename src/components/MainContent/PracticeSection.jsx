import React, { useState, useEffect, useCallback, useMemo, useReducer, useRef } from 'react';
import { BookOpen, ArrowRight, Send, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SharedContentViewer from '../SharedContent/SharedContentViewer';

const SUBJECTS = ['matematicas', 'ciencias', 'sociales', 'lenguaje', 'ingles'];
const QUESTIONS_PER_SESSION = 10;

// Función de utilidad para reintentos
const retryAsync = async (operation, maxRetries = 3) => {
  let retries = 0;
  let lastError = null;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      retries++;
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retrying
    }
  }
  
  throw lastError; // If we've exhausted retries, throw the last error
};

// Create a local reducer to better manage component state
const initialPracticeState = {
  selectedSubject: 'matematicas',
  userAnswer: '',
  selectedOption: null,
  score: 0,
  answeredQuestions: [],
  currentDifficulty: 'facil',
  isSubmitting: false,
  sessionState: 'chatting', // 'chatting', 'completed', 'no-questions', 'error'
  sessionStartTime: null,
  retryCount: 0,
  lastError: null,
  localMessages: []
};

function practiceReducer(state, action) {
  switch (action.type) {
    case 'SET_SUBJECT':
      return {
        ...state,
        selectedSubject: action.payload,
        userAnswer: '',
        selectedOption: null,
        score: 0,
        answeredQuestions: [],
        sessionState: 'chatting',
        sessionStartTime: Date.now()
      };
    case 'START_SESSION':
      return {
        ...state,
        sessionStartTime: Date.now()
      };
    case 'SET_DIFFICULTY':
      return {
        ...state,
        currentDifficulty: action.payload
      };
    case 'ANSWER_CORRECT':
      return {
        ...state,
        score: state.score + 1,
        answeredQuestions: action.payload && action.payload._id 
          ? [...state.answeredQuestions, action.payload._id]
          : state.answeredQuestions
      };
    case 'ANSWER_INCORRECT':
      return {
        ...state,
        answeredQuestions: action.payload && action.payload._id 
          ? [...state.answeredQuestions, action.payload._id]
          : state.answeredQuestions
      };
    case 'SET_USER_ANSWER':
      return {
        ...state,
        userAnswer: action.payload
      };
    case 'SET_SELECTED_OPTION':
      return {
        ...state,
        selectedOption: action.payload
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      };
    case 'NO_QUESTIONS_AVAILABLE':
      return {
        ...state,
        sessionState: 'no-questions'
      };
    case 'SESSION_COMPLETED':
      return {
        ...state,
        sessionState: 'completed'
      };
    case 'RESET_FOR_NEXT_QUESTION':
      return {
        ...state,
        userAnswer: '',
        selectedOption: null,
        sessionStartTime: Date.now(),
        isSubmitting: false,
        // No reseteamos localMessages aquí, se maneja explícitamente
      };
    case 'ERROR_STATE':
      return {
        ...state,
        lastError: action.payload,
        retryCount: state.retryCount + 1,
        isSubmitting: false
      };
    case 'UPDATE_LOCAL_MESSAGES':
      return {
        ...state,
        localMessages: action.payload
      };
    case 'ADD_LOCAL_MESSAGE':
      return {
        ...state,
        localMessages: [...state.localMessages, action.payload]
      };
    case 'COMPLETE_RESET':
      return {
        ...state,
        userAnswer: '',
        selectedOption: null,
        sessionStartTime: Date.now(),
        isSubmitting: false,
        localMessages: []
      };
    default:
      return state;
  }
}

const PracticeSection = () => {
  // App Context
  const {
    currentQuestion,
    progress,
    openaiChat,
    loading,
    error,
    fetchProgress,
    startOpenAIChat,
    sendOpenAIMessage,
    checkOpenAIAnswer,
    getNextOpenAIQuestion,
    resetOpenAIChat
  } = useApp();

  // Local state with reducer
  const [state, dispatch] = useReducer(practiceReducer, initialPracticeState);
  
  // Referencias
  const chatContainerRef = useRef(null);
  const messageEndRef = useRef(null);
  const unmountedRef = useRef(false);
  const transitioningRef = useRef(false);
  const nextQuestionTimeoutRef = useRef(null);
  
  // Destructure state for easier access
  const {
    selectedSubject,
    userAnswer,
    selectedOption,
    score,
    answeredQuestions,
    currentDifficulty,
    isSubmitting,
    sessionState,
    sessionStartTime,
    localMessages
  } = state;

  // Scroll to bottom of chat
  const scrollToBottom = useCallback(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Definir una función para manejar la transición a la siguiente pregunta
  const handleTransitionToNextQuestion = useCallback(() => {
    dispatch({ type: 'RESET_FOR_NEXT_QUESTION' });
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    // Limpiar mensajes locales antes de la petición para evitar duplicados
    dispatch({ type: 'UPDATE_LOCAL_MESSAGES', payload: [] });
    
    const getNextQuestionAsync = async () => {
      try {
        // Check if we've reached the maximum number of questions
        if (answeredQuestions.length >= QUESTIONS_PER_SESSION) {
          dispatch({ type: 'SESSION_COMPLETED' });
          transitioningRef.current = false;
          return;
        }
        
        // Determine if we should continue with the same shared content or get a new one
        let sharedContentId = null;
        
        // If we have shared content and there are more questions in the sequence, continue with it
        if (openaiChat.sharedContent && 
            openaiChat.currentQuestionNumber < openaiChat.totalQuestions) {
          sharedContentId = openaiChat.sharedContent._id;
        }
        
        // Get the next question with retry
        const response = await retryAsync(async () => {
          return await getNextOpenAIQuestion(selectedSubject, currentDifficulty, sharedContentId);
        });
        
        if (response.noQuestionsAvailable) {
          dispatch({ type: 'NO_QUESTIONS_AVAILABLE' });
        } else {
          // Sync with new messages
          if (response.chatHistory) {
            const displayMessages = response.chatHistory.filter(msg => msg.role !== 'system');
            dispatch({ type: 'UPDATE_LOCAL_MESSAGES', payload: displayMessages });
          }
        }
      } catch (error) {
        console.error('Error getting next question:', error);
        dispatch({ 
          type: 'ERROR_STATE', 
          payload: error
        });
        
        // Agregar mensaje de error al chat
        const errorMsg = { 
          role: 'assistant', 
          content: 'Lo siento, tuve un problema al obtener la siguiente pregunta. Por favor, intenta seleccionar otra materia o reiniciar la práctica.',
          isError: true 
        };
        dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: errorMsg });
      } finally {
        dispatch({ type: 'SET_SUBMITTING', payload: false });
        // Resetear el flag de transición
        transitioningRef.current = false;
      }
    };
    
    getNextQuestionAsync();
  }, [selectedSubject, currentDifficulty, getNextOpenAIQuestion, answeredQuestions.length, openaiChat, QUESTIONS_PER_SESSION, dispatch]);

  // Crear un alias para la función de transición para mantener compatibilidad
  const handleNextQuestion = handleTransitionToNextQuestion;

  // Actualizar el botón de cambio de materia para usar la nueva función auxiliar
  const handleSubjectChange = useCallback((subject) => {
    // Limpiar cualquier timeout pendiente
    if (nextQuestionTimeoutRef.current) {
      clearTimeout(nextQuestionTimeoutRef.current);
      nextQuestionTimeoutRef.current = null;
    }
    
    // Resetear flags
    transitioningRef.current = false;
    
    dispatch({ type: 'SET_SUBJECT', payload: subject });
    // También limpiar los mensajes locales explícitamente
    dispatch({ type: 'UPDATE_LOCAL_MESSAGES', payload: [] });
    resetOpenAIChat();
  }, [resetOpenAIChat]);

  // Watch for correct answers from OpenAI and update UI state
  useEffect(() => {
    if (openaiChat.isCorrect && !transitioningRef.current) {
      // Marcar que estamos en transición para evitar múltiples ejecuciones
      transitioningRef.current = true;
      
      dispatch({ type: 'ANSWER_CORRECT', payload: currentQuestion });
      
      // Mostrar mensaje de transición
      const correctMsg = { 
        role: 'assistant', 
        content: '¡Respuesta correcta! Avanzando a la siguiente pregunta...',
        isCorrect: true 
      };
      
      // Actualizar los mensajes solo si este mensaje aún no está presente
      if (!localMessages.some(msg => msg.isCorrect)) {
        dispatch({ 
          type: 'ADD_LOCAL_MESSAGE', 
          payload: correctMsg
        });
      }
      
      // Scroll al final para que el usuario vea el mensaje
      setTimeout(scrollToBottom, 50);
      
      // Automatically move to next question after a short delay
      // Guardamos el timeout en una ref para poder limpiarlo si es necesario
      nextQuestionTimeoutRef.current = setTimeout(() => {
        // Usar nuestra función auxiliar para la transición
        handleNextQuestion();
      }, 2000);
      
      return () => {
        if (nextQuestionTimeoutRef.current) {
          clearTimeout(nextQuestionTimeoutRef.current);
        }
      };
    }
  }, [openaiChat.isCorrect, currentQuestion, localMessages, scrollToBottom, handleNextQuestion]);

  // Inicializar sesión
  useEffect(() => {
    dispatch({ type: 'START_SESSION', payload: progress });
    
    // Iniciar la sesión con la materia seleccionada
    const startSession = async () => {
      try {
        await startOpenAIChat(selectedSubject, ['General']);
      } catch (error) {
        console.error('Error starting chat:', error);
        dispatch({ 
          type: 'ERROR_STATE', 
          payload: error
        });
      }
    };
    
    startSession();
    
    // Cleanup on unmount
    return () => {
      unmountedRef.current = true;
    };
  }, [selectedSubject, startOpenAIChat, progress]);

  // Sincronizar mensajes del contexto con el estado local para estabilidad
  useEffect(() => {
    if (openaiChat.messages && openaiChat.messages.length > 0) {
      // Filtrar mensajes de sistema
      const displayMessages = openaiChat.messages.filter(msg => msg.role !== 'system');
      
      // Solo actualizar si hay cambios significativos para evitar ciclos
      if (displayMessages.length !== localMessages.length) {
        // Conservar las propiedades isThinking e isError
        const updatedMessages = displayMessages.map(msg => {
          // Buscar si este mensaje ya existe en localMessages (por contenido)
          const existingMsg = localMessages.find(
            localMsg => 
              localMsg.role === msg.role && 
              localMsg.content === msg.content
          );
          
          if (existingMsg) {
            // Mantener propiedades especiales si existen
            return {
              ...msg,
              isThinking: existingMsg.isThinking || false,
              isError: existingMsg.isError || false
            };
          }
          
          return msg;
        });
        
        dispatch({ type: 'UPDATE_LOCAL_MESSAGES', payload: updatedMessages });
      }
    }
  }, [openaiChat.messages, localMessages]);

  // Scroll cuando cambian los mensajes
  useEffect(() => {
    scrollToBottom();
  }, [localMessages, scrollToBottom]);

  // Actualizar dificultad basada en el progreso
  useEffect(() => {
    if (progress?.subjectProgress) {
      const subjectProgress = progress.subjectProgress.find(sp => sp.subject === selectedSubject);
      if (subjectProgress) {
        dispatch({ type: 'SET_DIFFICULTY', payload: subjectProgress.currentDifficulty });
      }
    }
  }, [progress, selectedSubject]);

  // Watch for no questions available
  useEffect(() => {
    if (openaiChat.noQuestionsAvailable) {
      dispatch({ type: 'NO_QUESTIONS_AVAILABLE' });
    }
  }, [openaiChat.noQuestionsAvailable]);

  // Render message bubble for chat with improved feedback for correct answers
  const MessageBubble = ({ message, isUser, isCorrectAnswer, isError, isTransitionMessage }) => (
    <div className={`mb-4 ${isUser ? 'text-right' : ''}`}>
      <div className={`inline-block p-3 rounded-lg max-w-[85%] ${
        isUser 
          ? 'bg-indigo-100 text-indigo-800' 
          : isCorrectAnswer || isTransitionMessage
            ? 'bg-green-100 text-green-800 border border-green-200'
            : isError
              ? 'bg-red-50 text-red-800 border border-red-100'
              : 'bg-gray-100 text-gray-800'
      }`}>
        {(isCorrectAnswer || isTransitionMessage) && !isUser && (
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-green-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-green-700">
              {isTransitionMessage ? 'Avanzando...' : 'Respuesta correcta'}
            </span>
          </div>
        )}
        {isError && !isUser && (
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1 text-red-600" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="font-medium text-red-700">Error</span>
          </div>
        )}
        <p className="text-sm whitespace-pre-line break-words">{message}</p>
      </div>
      <div className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
        {isUser ? 'Tú' : 'Tutor ICFES'}
      </div>
    </div>
  );

  // Handle sending a message to the chat
  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim() || isSubmitting) return;
    
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    try {
      // Check if we have a valid question ID before proceeding
      if (!currentQuestion._id) {
        throw new Error('No valid question ID found');
      }
      
      // Store the user's message for immediate display
      const userMessage = userAnswer.trim();
      
      // Add user message to local state immediately for responsive UI
      const userMsg = { role: 'user', content: userMessage };
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: userMsg });
      
      // Clear input field immediately for better UX
      dispatch({ type: 'SET_USER_ANSWER', payload: '' });
      
      // Scroll to bottom after adding user message
      setTimeout(scrollToBottom, 50);
      
      // Add temporary thinking message
      const thinkingMsg = { role: 'assistant', content: '...', isThinking: true };
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: thinkingMsg });
      
      // Send message to OpenAI with retry
      const response = await retryAsync(async () => {
        return await sendOpenAIMessage(currentQuestion._id, userMessage, Date.now() - sessionStartTime);
      });
      
      // Remove the thinking message as we'll get real response from context
      dispatch({ 
        type: 'UPDATE_LOCAL_MESSAGES', 
        payload: localMessages.filter(msg => !msg.isThinking) 
      });
      
      // Check if the answer is correct
      // Only if it's likely an answer (not a question)
      if (!userMessage.includes('?') && userMessage.length < 100) {
        try {
          await retryAsync(async () => {
            await checkOpenAIAnswer(currentQuestion._id, userMessage);
          });
        } catch (error) {
          console.warn('Error checking answer:', error);
          // Continue even if answer checking fails
        }
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      
      // Remove any thinking messages
      const filteredMessages = localMessages.filter(msg => !msg.isThinking);
      
      // Add error message to chat
      const errorMsg = { 
        role: 'assistant', 
        content: 'Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo.',
        isError: true 
      };
      
      dispatch({ 
        type: 'UPDATE_LOCAL_MESSAGES', 
        payload: [...filteredMessages, errorMsg]
      });
      
      dispatch({ 
        type: 'ERROR_STATE', 
        payload: error
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Handle option selection
  const handleOptionSelect = async (optionText) => {
    if (!currentQuestion || isSubmitting || openaiChat.isCorrect) return;
    
    // Set the selected option
    dispatch({ type: 'SET_SELECTED_OPTION', payload: optionText });
    
    // Set the selected option as user answer
    dispatch({ type: 'SET_USER_ANSWER', payload: optionText });
    
    // Submit the answer immediately for multiple choice questions
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    try {
      // Check if we have a valid question ID before proceeding
      if (!currentQuestion._id) {
        throw new Error('No valid question ID found');
      }
      
      // Add user message to local state immediately
      const userMsg = { role: 'user', content: optionText };
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: userMsg });
      
      // Add temporary thinking message
      const thinkingMsg = { role: 'assistant', content: '...', isThinking: true };
      dispatch({ type: 'ADD_LOCAL_MESSAGE', payload: thinkingMsg });
      
      // Scroll to bottom after adding messages
      setTimeout(scrollToBottom, 50);
      
      // Send message to OpenAI with retry
      await retryAsync(async () => {
        return await sendOpenAIMessage(currentQuestion._id, optionText, Date.now() - sessionStartTime);
      });
      
      // Remove the thinking message
      dispatch({ 
        type: 'UPDATE_LOCAL_MESSAGES', 
        payload: localMessages.filter(msg => !msg.isThinking) 
      });
      
      // Para múltiple opción, verificar siempre si la respuesta es correcta
      try {
        await retryAsync(async () => {
          await checkOpenAIAnswer(currentQuestion._id, optionText);
        });
      } catch (error) {
        console.warn('Error checking option answer:', error);
        // Continuar incluso si falla la verificación
      }
    } catch (error) {
      console.error('Error submitting option:', error);
      
      // Remove any thinking messages
      const filteredMessages = localMessages.filter(msg => !msg.isThinking);
      
      // Add error message to chat
      const errorMsg = { 
        role: 'assistant', 
        content: 'Lo siento, tuve un problema al procesar tu selección. Por favor, intenta de nuevo.',
        isError: true 
      };
      
      dispatch({ 
        type: 'UPDATE_LOCAL_MESSAGES', 
        payload: [...filteredMessages, errorMsg]
      });
      
      dispatch({ 
        type: 'ERROR_STATE', 
        payload: error
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Render the main content based on session state
  const renderContent = () => {
    if (sessionState === 'no-questions') {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No hay más preguntas disponibles</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Hemos agotado las preguntas de <span className="font-medium capitalize">{selectedSubject}</span> en 
            nivel <span className="font-medium capitalize">{currentDifficulty}</span>. 
            ¡Te invitamos a probar otra materia!
          </p>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            {SUBJECTS.filter(s => s !== selectedSubject).map(subject => (
              <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-gray-500 text-sm">
            O prueba ajustar la dificultad en tu perfil para desbloquear más preguntas.
          </p>
        </div>
      );
    }

    if (sessionState === 'completed') {
      return (
        <div className="text-center p-8 bg-white rounded-lg shadow-sm">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold mb-2 text-gray-800">¡Práctica completada!</h3>
          <p className="text-lg text-gray-600 mb-2">Has completado todas las preguntas en esta sesión.</p>
          <div className="flex justify-center items-center mb-6">
            <div className="inline-block bg-indigo-100 text-indigo-800 rounded-full px-4 py-2 font-medium text-lg">
              Score: {score}/{answeredQuestions.length}
            </div>
          </div>
          <button
            onClick={() => handleSubjectChange(selectedSubject)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Comenzar nueva práctica
          </button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question & Content Panel */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          {loading.openai && !currentQuestion ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : currentQuestion ? (
            <div>
              {/* Shared Content */}
                {openaiChat.sharedContent && (
                <div className="border-b border-gray-100">
                  <div className="max-w-full overflow-x-auto">
                  <SharedContentViewer 
                    sharedContent={openaiChat.sharedContent}
                    currentQuestionNumber={openaiChat.currentQuestionNumber || 1}
                    totalQuestions={openaiChat.totalQuestions || 1}
                  />
                  </div>
                </div>
                )}
                
              {/* Question */}
              <div className="p-6">
                <div className="mb-6 bg-indigo-50 rounded-lg border border-indigo-100 p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{currentQuestion.questionText}</h3>
                  <div className="flex items-center text-xs text-indigo-600">
                    <BookOpen size={14} className="mr-1" />
                    <span className="capitalize">{selectedSubject}</span>
                    <span className="mx-1">•</span>
                    <span className="capitalize">{currentDifficulty}</span>
                  </div>
                </div>
                
                {/* Options */}
                {currentQuestion.options && currentQuestion.options.length > 0 && (
                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Selecciona una opción:</h4>
                    {currentQuestion.options.map((option, index) => (
                      <button
              key={index}
                        onClick={() => handleOptionSelect(option.text)}
                        disabled={isSubmitting || openaiChat.isCorrect}
                        className={`w-full p-3 text-left rounded-lg border transition-all duration-200 flex items-center justify-between group ${
                          selectedOption === option.text
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <span className={selectedOption === option.text ? "font-medium" : "text-gray-800"}>
                          {option.text}
                </span> 
                        {selectedOption === option.text ? (
                          isSubmitting ? (
                            <RefreshCw size={16} className="text-indigo-600 animate-spin" />
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                          )
                        ) : (
                          <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 transition-all duration-200" />
                        )}
              </button>
                    ))}
          </div>
        )}
                
                {/* Correct Answer Indicator */}
                {openaiChat.isCorrect && (
                  <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-700 mb-4 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    ¡Respuesta correcta! Avanzando a la siguiente pregunta...
        </div>
                )}
      </div>
          </div>
          ) : (
            <div className="text-center p-6">
              <p className="text-gray-500">No se ha podido cargar la pregunta. Intenta seleccionar otra materia.</p>
          </div>
          )}
        </div>
        
        {/* Chat Panel */}
        <div className="bg-white rounded-lg shadow-sm flex flex-col h-[600px]">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center">
            <div className={`w-2 h-2 ${isSubmitting ? 'bg-yellow-500' : 'bg-green-500'} rounded-full mr-2`}></div>
            <span className="font-medium text-gray-700">
              {isSubmitting ? 'Tutor ICFES (escribiendo...)' : 'Tutor ICFES'}
            </span>
      </div>
      
          {/* Messages */}
          <div 
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-3 chat-messages"
          >
            {localMessages.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <p className="text-gray-400 text-center text-sm">
                  El tutor está listo para ayudarte. <br />Selecciona una opción o escribe tu pregunta.
                </p>
              </div>
            ) : (
              <>
                {localMessages.map((msg, index) => {
                  if (msg.isThinking) {
                    return (
                      <div key={`thinking-${index}`} className="flex items-start">
                        <div className="bg-gray-100 text-gray-500 rounded-lg p-3 inline-flex items-center">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          </div>
      </div>
    </div>
  );
                  }
                  
                  // Determinar diferentes tipos de mensajes para visualización
                  const isCorrectAnswerFeedback = 
                    msg.role === 'assistant' && 
                    openaiChat.isCorrect && 
                    index === localMessages.length - 1 &&
                    !msg.isCorrect; // No es un mensaje de transición explícito
                  
                  const isTransitionMessage = msg.isCorrect === true;
                  
                  return (
                    <MessageBubble 
                      key={`msg-${index}`}
                      message={msg.content}
                      isUser={msg.role === 'user'}
                      isCorrectAnswer={isCorrectAnswerFeedback}
                      isError={msg.isError || false}
                      isTransitionMessage={isTransitionMessage}
                    />
                  );
                })}
                <div ref={messageEndRef} />
              </>
            )}
        </div>
          
          {/* Input */}
          <div className="p-4 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => dispatch({ type: 'SET_USER_ANSWER', payload: e.target.value })}
                placeholder="Escribe tu respuesta o pregunta..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting || openaiChat.isCorrect}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && handleAnswerSubmit()}
              />
                <button
                onClick={handleAnswerSubmit}
                disabled={isSubmitting || !userAnswer.trim() || openaiChat.isCorrect}
                className="p-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? (
                  <RefreshCw size={18} className="animate-spin" />
                ) : (
                  <Send size={18} />
                )}
                </button>
            </div>
            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {answeredQuestions.length}/{QUESTIONS_PER_SESSION} preguntas
          </div>
              <div className="text-xs text-gray-500 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {score} correctas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <h1 className="text-xl font-bold text-gray-900">Práctica ICFES</h1>
        
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
              className={`px-3 py-1.5 rounded-md transition-all duration-200 text-sm ${
                  selectedSubject === subject
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                disabled={isSubmitting}
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
        </div>
      </div>

      {error.openai ? (
        <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 mb-4">
          <p className="font-medium">Error: {error.openai}</p>
          <button
            onClick={() => {
              // Limpiar cualquier timeout pendiente
              if (nextQuestionTimeoutRef.current) {
                clearTimeout(nextQuestionTimeoutRef.current);
                nextQuestionTimeoutRef.current = null;
              }
              
              // Resetear flags
              transitioningRef.current = false;
              
              resetOpenAIChat();
              dispatch({ type: 'UPDATE_LOCAL_MESSAGES', payload: [] });
              startOpenAIChat(selectedSubject, ['General']);
            }}
            className="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm transition-colors"
          >
            Reintentar
          </button>
        </div>
      ) : null}

      {renderContent()}
    </div>
  );
};

export default PracticeSection; 
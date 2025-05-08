import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { BrainCircuit, BookOpen, Award, Clock, BarChart, AlertCircle, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoadingError } from '../LoadingError';
import AnimatedCharacter from '../AnimatedCharacter/AnimatedCharacter';
import SharedContentViewer from '../SharedContent/SharedContentViewer';

const SUBJECTS = ['matematicas', 'ciencias', 'sociales', 'lenguaje', 'ingles'];
const QUESTIONS_PER_SESSION = 10;

// Create a local reducer to better manage component state
const initialPracticeState = {
  selectedSubject: 'matematicas',
  userAnswer: '',
  showExplanation: false,
  score: 0,
  answeredQuestions: [],
  currentDifficulty: 'facil',
  feedback: null,
  isSubmitting: false,
  sessionState: 'chatting', // 'chatting', 'completed', 'no-questions', 'error'
  sessionStartTime: null,
  sessionStats: {
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0,
    averageResponseTime: 0
  },
  characterState: {
    state: 'idle',
    message: '¡Selecciona una materia y comencemos a practicar!',
    stats: {
      streak: 0,
      level: 1,
      subject: 'matematicas'
    }
  },
  retryCount: 0,
  lastError: null
};

function practiceReducer(state, action) {
  switch (action.type) {
    case 'SET_SUBJECT':
      return {
        ...state,
        selectedSubject: action.payload,
        userAnswer: '',
        showExplanation: false,
        feedback: null,
        score: 0,
        answeredQuestions: [],
        sessionState: 'chatting',
        sessionStartTime: Date.now(),
        characterState: {
          ...state.characterState,
          state: 'thinking',
          message: `Cambiando a ${action.payload}...`,
          stats: {
            streak: 0,
            level: 1,
            subject: action.payload
          }
        }
      };
    case 'START_SESSION':
      return {
        ...state,
        sessionStartTime: Date.now(),
        sessionStats: {
          correctAnswers: 0,
          incorrectAnswers: 0,
          timeSpent: 0,
          averageResponseTime: 0
        },
        characterState: {
          ...state.characterState,
          state: 'thinking',
          message: `Preparando preguntas de ${state.selectedSubject}...`,
          stats: {
            streak: action.payload?.currentStreak || 0,
            level: action.payload?.subjectProgress?.find(sp => 
              sp.subject === state.selectedSubject)?.level || 1,
            subject: state.selectedSubject
          }
        }
      };
    case 'SESSION_STARTED':
      return {
        ...state,
        characterState: {
          ...state.characterState,
          state: 'idle',
          message: `¡Comencemos con ${state.selectedSubject}! Responde las preguntas y te ayudaré en el proceso.`
        }
      };
    case 'SET_DIFFICULTY':
      return {
        ...state,
        currentDifficulty: action.payload
      };
    case 'ANSWER_CORRECT':
      return {
        ...state,
        showExplanation: true,
        score: state.score + 1,
        feedback: '¡Correcto!',
        characterState: {
          ...state.characterState,
          state: 'correct',
          message: '¡Excelente trabajo! Tu respuesta es correcta.',
          stats: {
            ...state.characterState.stats,
            streak: Math.min((state.characterState.stats.streak || 0) + 1, 5)
          }
        },
        sessionStats: {
          ...state.sessionStats,
          correctAnswers: state.sessionStats.correctAnswers + 1,
          timeSpent: state.sessionStats.timeSpent + (Date.now() - state.sessionStartTime),
          averageResponseTime: state.sessionStats.averageResponseTime === 0 
            ? (Date.now() - state.sessionStartTime)
            : (state.sessionStats.averageResponseTime * (state.sessionStats.correctAnswers + state.sessionStats.incorrectAnswers) + 
               (Date.now() - state.sessionStartTime)) / 
              (state.sessionStats.correctAnswers + state.sessionStats.incorrectAnswers + 1)
        },
        answeredQuestions: action.payload && action.payload._id 
          ? [...state.answeredQuestions, action.payload._id]
          : state.answeredQuestions
      };
    case 'ANSWER_INCORRECT':
      return {
        ...state,
        showExplanation: true,
        feedback: 'Incorrecto. Revisa la explicación para entender mejor.',
        characterState: {
          ...state.characterState,
          state: 'incorrect',
          message: 'No te preocupes, los errores son parte del aprendizaje. Revisa la explicación.',
          stats: {
            ...state.characterState.stats,
            streak: 0
          }
        },
        sessionStats: {
          ...state.sessionStats,
          incorrectAnswers: state.sessionStats.incorrectAnswers + 1,
          timeSpent: state.sessionStats.timeSpent + (Date.now() - state.sessionStartTime),
          averageResponseTime: state.sessionStats.averageResponseTime === 0 
            ? (Date.now() - state.sessionStartTime)
            : (state.sessionStats.averageResponseTime * (state.sessionStats.correctAnswers + state.sessionStats.incorrectAnswers) + 
               (Date.now() - state.sessionStartTime)) / 
              (state.sessionStats.correctAnswers + state.sessionStats.incorrectAnswers + 1)
        },
        answeredQuestions: action.payload && action.payload._id 
          ? [...state.answeredQuestions, action.payload._id]
          : state.answeredQuestions
      };
    case 'SET_USER_ANSWER':
      return {
        ...state,
        userAnswer: action.payload
      };
    case 'SET_SUBMITTING':
      return {
        ...state,
        isSubmitting: action.payload
      };
    case 'THINKING_MODE':
      return {
        ...state,
        characterState: {
          ...state.characterState,
          state: 'thinking',
          message: action.payload || 'Analizando tu respuesta...'
        }
      };
    case 'NO_QUESTIONS_AVAILABLE':
      return {
        ...state,
        sessionState: 'no-questions',
        characterState: {
          ...state.characterState,
          state: 'confused',
          message: 'No encuentro preguntas para esta combinación. ¿Qué te parece si probamos con otra materia o dificultad?'
        }
      };
    case 'SESSION_COMPLETED':
      return {
        ...state,
        sessionState: 'completed',
        characterState: {
          ...state.characterState,
          state: 'celebration',
          message: '¡Felicidades! Has completado todas las preguntas de esta sesión.'
        }
      };
    case 'RESET_FOR_NEXT_QUESTION':
      return {
        ...state,
        showExplanation: false,
        userAnswer: '',
        feedback: null,
        sessionStartTime: Date.now(),
        isSubmitting: false,
        characterState: {
          ...state.characterState,
          state: 'idle',
          message: '¡Aquí tienes la siguiente pregunta! Piénsala bien antes de responder.'
        }
      };
    case 'ERROR_STATE':
      return {
        ...state,
        lastError: action.payload,
        feedback: action.message || 'Ha ocurrido un error. Por favor, intenta de nuevo.',
        characterState: {
          ...state.characterState,
          state: 'confused',
          message: action.message || 'Tuve un problema. ¿Intentamos de nuevo?'
        },
        retryCount: state.retryCount + 1,
        isSubmitting: false
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
  
  // Destructure state for easier access
  const {
    selectedSubject,
    userAnswer,
    showExplanation,
    score,
    answeredQuestions,
    currentDifficulty,
    feedback,
    isSubmitting,
    sessionState,
    sessionStartTime,
    sessionStats,
    characterState,
    retryCount
  } = state;

  // Inicializar sesión
  useEffect(() => {
    dispatch({ type: 'START_SESSION', payload: progress });
    
    // Iniciar la sesión con la materia seleccionada
    const startSession = async () => {
      try {
        await startOpenAIChat(selectedSubject, ['General']);
        dispatch({ type: 'SESSION_STARTED' });
      } catch (error) {
        console.error('Error starting chat:', error);
        dispatch({ 
          type: 'ERROR_STATE', 
          payload: error,
          message: 'Error al iniciar el chat. Intenta de nuevo.'
        });
      }
    };
    
    startSession();
  }, [selectedSubject, startOpenAIChat, progress]);

  // Actualizar dificultad basada en el progreso
  useEffect(() => {
    if (progress?.subjectProgress) {
      const subjectProgress = progress.subjectProgress.find(sp => sp.subject === selectedSubject);
      if (subjectProgress) {
        dispatch({ type: 'SET_DIFFICULTY', payload: subjectProgress.currentDifficulty });
      }
    }
  }, [progress, selectedSubject]);

  // Watch for correct answers from OpenAI and update UI state
  useEffect(() => {
    if (openaiChat.isCorrect && !showExplanation) {
      dispatch({ type: 'ANSWER_CORRECT', payload: currentQuestion });
    } else if (openaiChat.isCorrect === false && !showExplanation) {
      dispatch({ type: 'ANSWER_INCORRECT', payload: currentQuestion });
    }
  }, [openaiChat.isCorrect, showExplanation, currentQuestion]);

  // Watch for no questions available
  useEffect(() => {
    if (openaiChat.noQuestionsAvailable) {
      dispatch({ type: 'NO_QUESTIONS_AVAILABLE' });
    }
  }, [openaiChat.noQuestionsAvailable]);

  // Calcular estadísticas de la sesión
  const sessionMetrics = useMemo(() => {
    const totalQuestions = sessionStats.correctAnswers + sessionStats.incorrectAnswers;
    const accuracy = totalQuestions > 0 
      ? (sessionStats.correctAnswers / totalQuestions) * 100 
      : 0;
    const timeSpentMinutes = Math.round(sessionStats.timeSpent / 60000);
    
    return {
      accuracy,
      timeSpentMinutes,
      totalQuestions,
      averageResponseTime: Math.round(sessionStats.averageResponseTime / 1000)
    };
  }, [sessionStats]);

  const handleSubjectChange = useCallback((subject) => {
    dispatch({ type: 'SET_SUBJECT', payload: subject });
    resetOpenAIChat();
  }, [resetOpenAIChat]);

  // Add a retry function for API calls
  const retryOperation = useCallback(async (operation, maxRetries = 2) => {
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
  }, []);

  // Improve the handleAnswerSubmit with retry logic
  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'THINKING_MODE' });
    
    try {
      // Check if we have a valid question ID before proceeding
      if (!currentQuestion._id) {
        throw new Error('No valid question ID found');
      }
      
      // Send message to OpenAI with retry
      await retryOperation(async () => {
        await sendOpenAIMessage(currentQuestion._id, userAnswer, Date.now() - sessionStartTime);
      });
      
      dispatch({ type: 'SET_USER_ANSWER', payload: '' });
      
      // Check if the answer needs to be explicitly checked
      if (userAnswer.length > 50 || userAnswer.includes('?')) {
        // User is probably asking a question or providing a detailed response
        // Don't check for correctness yet
      } else {
        // User might be providing a direct answer, check if it's correct
        await retryOperation(async () => {
          await checkOpenAIAnswer(currentQuestion._id, userAnswer);
        });
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      dispatch({ 
        type: 'ERROR_STATE', 
        payload: error,
        message: 'Error al enviar la respuesta. Intenta de nuevo.'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Improve handleNextQuestion with retry logic
  const handleNextQuestion = useCallback(async () => {
    dispatch({ type: 'RESET_FOR_NEXT_QUESTION' });
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    dispatch({ type: 'THINKING_MODE', payload: 'Buscando la siguiente pregunta...' });
    
    try {
      // Check if we've reached the maximum number of questions
      if (answeredQuestions.length >= QUESTIONS_PER_SESSION) {
        dispatch({ type: 'SESSION_COMPLETED' });
        return;
      }
      
      // Obtener el ID del contenido compartido si existe
      const sharedContentId = openaiChat.sharedContent ? openaiChat.sharedContent._id : null;
      
      // Get the next question with retry
      const response = await retryOperation(async () => {
        return await getNextOpenAIQuestion(selectedSubject, currentDifficulty, sharedContentId);
      });
      
      if (response.noQuestionsAvailable) {
        dispatch({ type: 'NO_QUESTIONS_AVAILABLE' });
      } else {
        dispatch({ type: 'RESET_FOR_NEXT_QUESTION' });
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      dispatch({ 
        type: 'ERROR_STATE', 
        payload: error,
        message: 'Error al obtener la siguiente pregunta. Intenta de nuevo.'
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [selectedSubject, currentDifficulty, getNextOpenAIQuestion, answeredQuestions.length, retryOperation, openaiChat]);

  // Add a better error boundary component
  const ErrorBoundaryComponent = ({ children, error, onRetry }) => {
    if (error) {
      return (
        <div className="p-6 bg-white rounded-lg border border-red-100 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <AlertCircle size={24} className="text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-red-800">Hubo un problema</h3>
          </div>
          <p className="text-red-600 mb-4">{typeof error === 'string' ? error : error?.message || 'Ocurrió un error al procesar tu solicitud'}</p>
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-medium rounded-md transition-colors"
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }
    
    return children;
  };

  const renderQuestion = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <ErrorBoundaryComponent error={error.openai} onRetry={() => {
          resetOpenAIChat();
          dispatch({ type: 'START_SESSION', payload: progress });
          startOpenAIChat(selectedSubject, ['General']);
        }}>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {currentQuestion && (
              <>
                {/* Mostrar contenido compartido si existe */}
                {openaiChat.sharedContent && (
                  <SharedContentViewer 
                    sharedContent={openaiChat.sharedContent}
                    currentQuestionNumber={openaiChat.currentQuestionNumber || 1}
                    totalQuestions={openaiChat.totalQuestions || 1}
                  />
                )}
                
                <div className="p-5 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg border border-indigo-100 shadow-sm mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{currentQuestion.questionText}</h3>
                  <div className="flex items-center text-xs text-indigo-700 font-medium">
                    <BookOpen size={14} className="mr-1" />
                    <span className="capitalize">{selectedSubject}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{currentDifficulty}</span>
                  </div>
                </div>
                
                {feedback && (
                  <div className={`mb-4 p-4 rounded-lg shadow-sm ${
                    feedback.includes('Correcto') 
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-100' 
                      : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-100'
                  }`}>
                    <div className="font-medium">{feedback}</div>
                  </div>
                )}

                {showExplanation && (
                  <div className="mb-4 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-indigo-100 shadow-sm">
                    <h4 className="font-medium text-indigo-900 mb-2 flex items-center">
                      <Award size={18} className="mr-2" />
                      ¡Respuesta Correcta!
                    </h4>
                  </div>
                )}
              </>
            )}
          </div>
        </ErrorBoundaryComponent>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm max-h-96 overflow-y-auto">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center">
            <BrainCircuit size={18} className="mr-2 text-indigo-600" />
            Conversación con el tutor
          </h4>
          {openaiChat.messages.map((msg, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg mb-3 ${
                msg.role === 'assistant' 
                  ? 'bg-indigo-50 border-l-4 border-indigo-400 text-indigo-800' 
                  : 'bg-gray-50 border-l-4 border-gray-400 text-gray-800'
              }`}
            >
              <div className="font-medium mb-1">
                {msg.role === 'assistant' ? 'Tutor ICFES:' : 'Tú:'}
              </div>
              <div className="text-sm">{msg.content}</div>
            </div>
          ))}
        </div>

        {!showExplanation ? (
          <div className="mt-6">
            <ErrorBoundaryComponent error={error.openai} onRetry={handleAnswerSubmit}>
              <textarea
                value={userAnswer}
                onChange={(e) => dispatch({ type: 'SET_USER_ANSWER', payload: e.target.value })}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full p-4 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                rows="4"
                disabled={isSubmitting}
              />
            </ErrorBoundaryComponent>
            <button
              onClick={handleAnswerSubmit}
              disabled={isSubmitting || !userAnswer.trim()}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md disabled:opacity-50 transition-all duration-200"
            >
              {isSubmitting ? 
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span> 
                : 'Enviar Respuesta'
              }
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <ErrorBoundaryComponent error={error.openai} onRetry={handleNextQuestion}>
              <button
                onClick={handleNextQuestion}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 shadow-md transition-all duration-200 flex items-center justify-center"
                disabled={isSubmitting}
              >
                {isSubmitting ? 
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Cargando...
                  </span> 
                  : 'Siguiente Pregunta'
                }
              </button>
            </ErrorBoundaryComponent>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompletion = () => (
    <div className="py-8 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center p-3 bg-indigo-100 rounded-full mb-4">
          <Award size={32} className="text-indigo-600" />
        </div>
        <h3 className="text-2xl font-bold mb-2 text-gray-900">¡Felicidades!</h3>
        <p className="text-lg mb-6 text-gray-600">Has completado todas las preguntas de {selectedSubject}.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-5 border border-indigo-100">
          <div className="flex items-center mb-3">
            <BarChart size={20} className="text-indigo-600 mr-2" />
            <h4 className="font-medium text-indigo-900">Rendimiento</h4>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Puntuación final:</span>
            <span className="font-bold text-indigo-700">{score}/{answeredQuestions.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Precisión:</span>
            <span className="font-bold text-indigo-700">{sessionMetrics.accuracy.toFixed(1)}%</span>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-5 border border-indigo-100">
          <div className="flex items-center mb-3">
            <Clock size={20} className="text-indigo-600 mr-2" />
            <h4 className="font-medium text-indigo-900">Tiempo</h4>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-600">Tiempo total:</span>
            <span className="font-bold text-indigo-700">{sessionMetrics.timeSpentMinutes} minutos</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tiempo por pregunta:</span>
            <span className="font-bold text-indigo-700">{sessionMetrics.averageResponseTime} segundos</span>
          </div>
        </div>
      </div>
      
      <div className="text-center mt-4">
        <button
          onClick={() => handleSubjectChange(selectedSubject)}
          className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md transition-all duration-200"
        >
          Reiniciar Práctica
        </button>
      </div>
    </div>
  );

  const renderNoQuestionsAvailable = () => (
    <div className="py-10 px-6 bg-white rounded-lg border border-gray-200 shadow-sm text-center">
      <div className="mb-6 flex justify-center">
        <div className="p-4 bg-amber-50 rounded-full">
          <AlertCircle size={40} className="text-amber-500" />
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">No hay preguntas disponibles</h3>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">
        Actualmente no tenemos preguntas para {selectedSubject} en nivel {currentDifficulty}. 
        Estamos trabajando para ampliar nuestra base de datos.
      </p>
      
      <div className="mb-8">
        <h4 className="font-medium text-gray-800 mb-4">¿Qué puedes hacer ahora?</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-lg border border-indigo-100 text-left">
            <h5 className="font-medium text-indigo-800 mb-2">Cambiar de materia</h5>
            <p className="text-sm text-gray-600 mb-3">Prueba con otra asignatura que puede tener preguntas disponibles.</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {SUBJECTS.filter(s => s !== selectedSubject).map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectChange(subject)}
                  className="px-3 py-1.5 text-sm bg-white text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all duration-200"
                >
                  {subject.charAt(0).toUpperCase() + subject.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-indigo-100 text-left">
            <h5 className="font-medium text-indigo-800 mb-2">Ajustar dificultad</h5>
            <p className="text-sm text-gray-600 mb-3">La dificultad actual es <span className="font-medium capitalize">{currentDifficulty}</span>. Prueba con otra dificultad.</p>
            <div className="flex gap-2 mt-2">
              {['facil', 'medio', 'dificil'].filter(d => d !== currentDifficulty).map((difficulty) => (
                <button
                  key={difficulty}
                  onClick={() => {
                    // Esta función simplemente simula un cambio de dificultad y reinicia
                    dispatch({ type: 'SET_DIFFICULTY', payload: difficulty });
                    handleSubjectChange(selectedSubject);
                  }}
                  className="px-3 py-1.5 text-sm bg-white text-indigo-600 rounded-lg border border-indigo-200 hover:bg-indigo-50 shadow-sm transition-all duration-200"
                >
                  <span className="capitalize">{difficulty}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={() => window.location.reload()}
        className="mt-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg hover:from-indigo-700 hover:to-indigo-800 shadow-md transition-all duration-200 inline-flex items-center"
      >
        Volver al inicio
        <ArrowRight size={16} className="ml-2" />
      </button>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-2 bg-indigo-100 rounded-lg">
          <BrainCircuit className="text-indigo-600" size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Práctica ICFES</h1>
      </div>

      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-4">
          <div className="flex flex-wrap gap-2">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                  selectedSubject === subject
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md' 
                    : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm'
                }`}
                disabled={isSubmitting}
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
          </div>
          <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex items-center gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Puntuación</p>
              <p className="text-lg font-bold text-indigo-600">{score}</p>
            </div>
            <div className="h-8 border-l border-gray-200"></div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Dificultad</p>
              <p className="text-sm font-medium capitalize text-indigo-600">{currentDifficulty}</p>
            </div>
            <div className="h-8 border-l border-gray-200"></div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Pregunta</p>
              <p className="text-sm font-medium text-indigo-600">{answeredQuestions.length + 1}/{QUESTIONS_PER_SESSION}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ErrorBoundaryComponent 
            error={error.openai}
            onRetry={() => {
              resetOpenAIChat();
              dispatch({ type: 'START_SESSION', payload: progress });
              startOpenAIChat(selectedSubject, ['General']);
            }}
          >
            <LoadingError
              loading={loading.openai}
              error={null} // We're handling errors with our own component now
              onRetry={() => {}}
            >
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                {sessionState === 'chatting' && renderQuestion()}
                {sessionState === 'completed' && renderCompletion()}
                {sessionState === 'no-questions' && renderNoQuestionsAvailable()}
                {sessionState === 'error' && (
                  <div className="p-6 text-center">
                    <div className="p-4 bg-red-50 rounded-lg mb-4">
                      <AlertCircle size={32} className="text-red-500 mx-auto mb-2" />
                      <p className="text-red-700">{state.lastError?.message || 'Ha ocurrido un error. Por favor, intenta de nuevo.'}</p>
                    </div>
                    <button
                      onClick={() => handleSubjectChange(selectedSubject)}
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
                    >
                      Reintentar
                    </button>
                  </div>
                )}
              </div>
            </LoadingError>
          </ErrorBoundaryComponent>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AnimatedCharacter 
              state={characterState.state}
              message={characterState.message}
              stats={characterState.stats}
              className="w-full"
              position="normal"
            />

            <ErrorBoundaryComponent
              error={error.progress}
              onRetry={fetchProgress}
            >
              <LoadingError
                loading={loading.progress}
                error={null} // We're handling errors with our own component now
                onRetry={() => {}}
              >
                {progress && (
                  <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award size={18} className="mr-2 text-indigo-600" />
                      Tu Progreso
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-100">
                        <p className="text-xs text-gray-600 mb-1">Racha Actual</p>
                        <p className="text-lg font-bold text-indigo-700">{progress.currentStreak} días</p>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-indigo-100">
                        <p className="text-xs text-gray-600 mb-1">Mejor Racha</p>
                        <p className="text-lg font-bold text-indigo-700">{progress.longestStreak} días</p>
                      </div>
                      {progress.statistics && (
                        <>
                          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-100">
                            <p className="text-xs text-gray-600 mb-1">Precisión Promedio</p>
                            <p className="text-lg font-bold text-indigo-700">{progress.statistics.averageAccuracy?.toFixed(1) || 0}%</p>
                          </div>
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-indigo-100">
                            <p className="text-xs text-gray-600 mb-1">Mejor Materia</p>
                            <p className="text-lg font-bold text-indigo-700 capitalize">{progress.statistics.bestSubject?.subject || '-'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </LoadingError>
            </ErrorBoundaryComponent>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PracticeSection; 
import React, { useState, useEffect, useCallback, useMemo, useReducer } from 'react';
import { BookOpen, ArrowRight, Send, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import SharedContentViewer from '../SharedContent/SharedContentViewer';

const SUBJECTS = ['matematicas', 'ciencias', 'sociales', 'lenguaje', 'ingles'];
const QUESTIONS_PER_SESSION = 10;

// Create a local reducer to better manage component state
const initialPracticeState = {
  selectedSubject: 'matematicas',
  userAnswer: '',
  score: 0,
  answeredQuestions: [],
  currentDifficulty: 'facil',
  isSubmitting: false,
  sessionState: 'chatting', // 'chatting', 'completed', 'no-questions', 'error'
  sessionStartTime: null,
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
        sessionStartTime: Date.now(),
        isSubmitting: false
      };
    case 'ERROR_STATE':
      return {
        ...state,
        lastError: action.payload,
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
    score,
    answeredQuestions,
    currentDifficulty,
    isSubmitting,
    sessionState,
    sessionStartTime
  } = state;

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
    if (openaiChat.isCorrect) {
      dispatch({ type: 'ANSWER_CORRECT', payload: currentQuestion });
      
      // Automatically move to next question after a short delay
      const timer = setTimeout(() => {
        handleNextQuestion();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [openaiChat.isCorrect, currentQuestion]);

  // Watch for no questions available
  useEffect(() => {
    if (openaiChat.noQuestionsAvailable) {
      dispatch({ type: 'NO_QUESTIONS_AVAILABLE' });
    }
  }, [openaiChat.noQuestionsAvailable]);

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

  // Handle sending a message to the chat
  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
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
        payload: error
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  };

  // Handle option selection
  const handleOptionSelect = async (optionText) => {
    if (!currentQuestion || isSubmitting) return;
    
    // Set the selected option as user answer
    dispatch({ type: 'SET_USER_ANSWER', payload: optionText });
    
    // Submit the answer
    await handleAnswerSubmit();
  };

  // Handle getting the next question
  const handleNextQuestion = useCallback(async () => {
    dispatch({ type: 'RESET_FOR_NEXT_QUESTION' });
    dispatch({ type: 'SET_SUBMITTING', payload: true });
    
    try {
      // Check if we've reached the maximum number of questions
      if (answeredQuestions.length >= QUESTIONS_PER_SESSION) {
        dispatch({ type: 'SESSION_COMPLETED' });
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
        payload: error
      });
    } finally {
      dispatch({ type: 'SET_SUBMITTING', payload: false });
    }
  }, [selectedSubject, currentDifficulty, getNextOpenAIQuestion, answeredQuestions.length, retryOperation, openaiChat]);

  // Render message bubble for chat
  const MessageBubble = ({ message, isUser }) => (
    <div className={`mb-3 ${isUser ? 'text-right' : ''}`}>
      <div className={`inline-block p-3 rounded-lg ${
        isUser 
          ? 'bg-indigo-100 text-indigo-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        <p className="text-sm whitespace-pre-line">{message}</p>
      </div>
    </div>
  );

  // Render the main content based on session state
  const renderContent = () => {
    if (sessionState === 'no-questions') {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <p className="text-gray-700 mb-4">No hay preguntas disponibles para esta materia y dificultad.</p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUBJECTS.filter(s => s !== selectedSubject).map(subject => (
              <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
                className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md transition-colors"
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
          </div>
        </div>
      );
    }

    if (sessionState === 'completed') {
      return (
        <div className="text-center p-6 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-semibold mb-4">¡Práctica completada!</h3>
          <p className="text-gray-700 mb-4">Has respondido {score} de {answeredQuestions.length} preguntas correctamente.</p>
          <button
            onClick={() => handleSubjectChange(selectedSubject)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors"
          >
            Comenzar nueva práctica
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question Panel */}
        <div className="md:col-span-2 bg-white rounded-lg shadow-sm p-4">
          {loading.openai && !currentQuestion ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : currentQuestion ? (
            <div className="space-y-4">
              {/* Shared Content */}
              {openaiChat.sharedContent && (
                <SharedContentViewer 
                  sharedContent={openaiChat.sharedContent}
                  currentQuestionNumber={openaiChat.currentQuestionNumber || 1}
                  totalQuestions={openaiChat.totalQuestions || 1}
                />
              )}
              
              {/* Question */}
              <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
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
                <div className="space-y-2">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleOptionSelect(option.text)}
                      disabled={isSubmitting || openaiChat.isCorrect}
                      className="w-full p-3 text-left rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-gray-50 transition-all duration-200 flex items-center justify-between group"
                    >
                      <span className="text-gray-800">{option.text}</span>
                      <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 transition-all duration-200" />
                    </button>
                  ))}
                </div>
              )}
              
              {/* Correct Answer Indicator */}
              {openaiChat.isCorrect && (
                <div className="p-3 bg-green-50 border border-green-100 rounded-lg text-green-700">
                  ¡Respuesta correcta! Avanzando a la siguiente pregunta...
                </div>
              )}
            </div>
          ) : (
            <div className="text-center p-4">
              <p className="text-gray-500">No se ha podido cargar la pregunta. Intenta seleccionar otra materia.</p>
            </div>
          )}
        </div>
        
        {/* Chat Panel */}
        <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col h-[500px]">
          <div className="text-sm font-medium text-gray-700 mb-2 pb-2 border-b">
            Tutor ICFES
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto mb-3 space-y-1">
            {openaiChat.messages.map((msg, index) => {
              if (msg.role === 'system') return null;
              return (
                <MessageBubble 
                  key={index}
                  message={msg.content}
                  isUser={msg.role === 'user'}
                />
              );
            })}
          </div>
          
          {/* Input */}
          <div className="mt-auto">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => dispatch({ type: 'SET_USER_ANSWER', payload: e.target.value })}
                placeholder="Escribe tu respuesta o pregunta..."
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
                disabled={isSubmitting}
                onKeyPress={(e) => e.key === 'Enter' && userAnswer.trim() && handleAnswerSubmit()}
              />
              <button
                onClick={handleAnswerSubmit}
                disabled={isSubmitting || !userAnswer.trim()}
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
              <div className="text-xs text-gray-500">
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
              resetOpenAIChat();
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
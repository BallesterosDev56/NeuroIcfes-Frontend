import React, { createContext, useContext, useReducer, useCallback } from 'react';
import {questionService} from '../services/QuestionService';
import ProgressService from '../services/ProgressService';
import ChatService from '../services/ChatService';
import OpenAIService from '../services/openaiService';

const AppContext = createContext();

const initialState = {
  questions: [],
  currentQuestion: null,
  progress: null,
  chatHistory: [],
  openaiChat: {
    messages: [],
    isCorrect: false,
    lastQuestion: null,
    noQuestionsAvailable: false
  },
  loading: {
    questions: false,
    progress: false,
    chat: false,
    openai: false
  },
  error: {
    questions: null,
    progress: null,
    chat: null,
    openai: null
  }
};

function appReducer(state, action) {
  switch (action.type) {
    case 'FETCH_QUESTIONS_START':
      return {
        ...state,
        loading: { ...state.loading, questions: true },
        error: { ...state.error, questions: null }
      };
    case 'FETCH_QUESTIONS_SUCCESS':
      return {
        ...state,
        questions: action.payload,
        loading: { ...state.loading, questions: false }
      };
    case 'FETCH_QUESTIONS_ERROR':
      return {
        ...state,
        loading: { ...state.loading, questions: false },
        error: { ...state.error, questions: action.payload }
      };
    case 'SET_CURRENT_QUESTION':
      return {
        ...state,
        currentQuestion: action.payload
      };
    case 'FETCH_PROGRESS_START':
      return {
        ...state,
        loading: { ...state.loading, progress: true },
        error: { ...state.error, progress: null }
      };
    case 'FETCH_PROGRESS_SUCCESS':
      return {
        ...state,
        progress: action.payload,
        loading: { ...state.loading, progress: false }
      };
    case 'FETCH_PROGRESS_ERROR':
      return {
        ...state,
        loading: { ...state.loading, progress: false },
        error: { ...state.error, progress: action.payload }
      };
    case 'FETCH_CHAT_HISTORY_START':
      return {
        ...state,
        loading: { ...state.loading, chat: true },
        error: { ...state.error, chat: null }
      };
    case 'FETCH_CHAT_HISTORY_SUCCESS':
      return {
        ...state,
        chatHistory: action.payload,
        loading: { ...state.loading, chat: false }
      };
    case 'FETCH_CHAT_HISTORY_ERROR':
      return {
        ...state,
        loading: { ...state.loading, chat: false },
        error: { ...state.error, chat: action.payload }
      };
    case 'ADD_CHAT_MESSAGE':
      return {
        ...state,
        chatHistory: [...state.chatHistory, action.payload]
      };
    case 'CREATE_QUESTION_SUCCESS':
      return {
        ...state,
        questions: [...state.questions, action.payload]
      };
    case 'UPDATE_QUESTION_SUCCESS':
      return {
        ...state,
        questions: state.questions.map(q => 
          q._id === action.payload._id ? action.payload : q
        )
      };
    case 'DELETE_QUESTION_SUCCESS':
      return {
        ...state,
        questions: state.questions.filter(q => q._id !== action.payload)
      };
    case 'OPENAI_CHAT_START':
      return {
        ...state,
        loading: { ...state.loading, openai: true },
        error: { ...state.error, openai: null },
        openaiChat: {
          ...state.openaiChat,
          messages: [],
          isCorrect: false,
          noQuestionsAvailable: false
        }
      };
    case 'OPENAI_CHAT_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, openai: false },
        openaiChat: {
          ...state.openaiChat,
          messages: action.payload.chatHistory || [],
          lastQuestion: action.payload.question || null,
          noQuestionsAvailable: action.payload.noQuestionsAvailable || false
        },
        currentQuestion: action.payload.question || state.currentQuestion
      };
    case 'OPENAI_CHAT_ERROR':
      return {
        ...state,
        loading: { ...state.loading, openai: false },
        error: { ...state.error, openai: action.payload }
      };
    case 'OPENAI_MESSAGE_START':
      return {
        ...state,
        loading: { ...state.loading, openai: true }
      };
    case 'OPENAI_MESSAGE_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, openai: false },
        openaiChat: {
          ...state.openaiChat,
          messages: action.payload.chatHistory || state.openaiChat.messages,
          isCorrect: action.payload.isCorrect || false
        }
      };
    case 'OPENAI_MESSAGE_ERROR':
      return {
        ...state,
        loading: { ...state.loading, openai: false },
        error: { ...state.error, openai: action.payload }
      };
    case 'OPENAI_NEXT_QUESTION_START':
      return {
        ...state,
        loading: { ...state.loading, openai: true },
        error: { ...state.error, openai: null }
      };
    case 'OPENAI_NEXT_QUESTION_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, openai: false },
        openaiChat: {
          ...state.openaiChat,
          messages: [],
          isCorrect: false,
          lastQuestion: action.payload.question || null,
          noQuestionsAvailable: action.payload.noQuestionsAvailable || false
        },
        currentQuestion: action.payload.question || state.currentQuestion
      };
    case 'OPENAI_NEXT_QUESTION_ERROR':
      return {
        ...state,
        loading: { ...state.loading, openai: false },
        error: { ...state.error, openai: action.payload }
      };
    case 'OPENAI_RESET_CHAT':
      return {
        ...state,
        openaiChat: {
          messages: [],
          isCorrect: false,
          lastQuestion: null,
          noQuestionsAvailable: false
        },
        error: { ...state.error, openai: null }
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const fetchQuestions = useCallback(async (subject, difficulty) => {
    dispatch({ type: 'FETCH_QUESTIONS_START' });
    try {
      const questions = await questionService.getQuestions(subject, difficulty);
      dispatch({ type: 'FETCH_QUESTIONS_SUCCESS', payload: questions });
      
      if (questions && questions.length > 0) {
        dispatch({ type: 'SET_CURRENT_QUESTION', payload: questions[0] });
      }
      
      return questions;
    } catch (error) {
      dispatch({ type: 'FETCH_QUESTIONS_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const fetchProgress = useCallback(async () => {
    dispatch({ type: 'FETCH_PROGRESS_START' });
    try {
      const progress = await ProgressService.getProgress();
      dispatch({ type: 'FETCH_PROGRESS_SUCCESS', payload: progress });
      return progress;
    } catch (error) {
      dispatch({ type: 'FETCH_PROGRESS_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const fetchChatHistory = useCallback(async () => {
    dispatch({ type: 'FETCH_CHAT_HISTORY_START' });
    try {
      const history = await ChatService.getChatHistory();
      dispatch({ type: 'FETCH_CHAT_HISTORY_SUCCESS', payload: history });
      return history;
    } catch (error) {
      dispatch({ type: 'FETCH_CHAT_HISTORY_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const sendChatMessage = useCallback(async (questionId, message) => {
    try {
      const response = await ChatService.sendMessage(questionId, message);
      dispatch({ type: 'ADD_CHAT_MESSAGE', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'FETCH_CHAT_HISTORY_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const createQuestion = useCallback(async (questionData) => {
    try {
      const question = await questionService.createQuestion(questionData);
      dispatch({ type: 'CREATE_QUESTION_SUCCESS', payload: question });
      return question;
    } catch (error) {
      dispatch({ type: 'FETCH_QUESTIONS_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const updateQuestion = useCallback(async (questionId, questionData) => {
    try {
      const question = await questionService.updateQuestion(questionId, questionData);
      dispatch({ type: 'UPDATE_QUESTION_SUCCESS', payload: question });
      return question;
    } catch (error) {
      dispatch({ type: 'FETCH_QUESTIONS_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const deleteQuestion = useCallback(async (questionId) => {
    try {
      await questionService.deleteQuestion(questionId);
      dispatch({ type: 'DELETE_QUESTION_SUCCESS', payload: questionId });
    } catch (error) {
      dispatch({ type: 'FETCH_QUESTIONS_ERROR', payload: error.message });
      throw error;
    }
  }, []);

  const startOpenAIChat = useCallback(async (subject, interests) => {
    dispatch({ type: 'OPENAI_CHAT_START' });
    try {
      const response = await OpenAIService.startChat(subject, interests);
      dispatch({ type: 'OPENAI_CHAT_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'OPENAI_CHAT_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const sendOpenAIMessage = useCallback(async (questionId, message, timeSpent) => {
    dispatch({ type: 'OPENAI_MESSAGE_START' });
    try {
      const response = await OpenAIService.sendMessage(questionId, message, timeSpent);
      dispatch({ type: 'OPENAI_MESSAGE_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'OPENAI_MESSAGE_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const checkOpenAIAnswer = useCallback(async (questionId, answer) => {
    dispatch({ type: 'OPENAI_MESSAGE_START' });
    try {
      const response = await OpenAIService.checkAnswer(questionId, answer);
      dispatch({ type: 'OPENAI_MESSAGE_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'OPENAI_MESSAGE_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const getNextOpenAIQuestion = useCallback(async (subject, difficulty) => {
    dispatch({ type: 'OPENAI_NEXT_QUESTION_START' });
    try {
      const response = await OpenAIService.getNextQuestion(subject, difficulty);
      dispatch({ type: 'OPENAI_NEXT_QUESTION_SUCCESS', payload: response });
      return response;
    } catch (error) {
      dispatch({ type: 'OPENAI_NEXT_QUESTION_ERROR', payload: error.message });
      throw error;
    }
  }, []);
  
  const resetOpenAIChat = useCallback(() => {
    dispatch({ type: 'OPENAI_RESET_CHAT' });
  }, []);

  const value = {
    ...state,
    fetchQuestions,
    fetchProgress,
    fetchChatHistory,
    sendChatMessage,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    startOpenAIChat,
    sendOpenAIMessage,
    checkOpenAIAnswer,
    getNextOpenAIQuestion,
    resetOpenAIChat
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
} 
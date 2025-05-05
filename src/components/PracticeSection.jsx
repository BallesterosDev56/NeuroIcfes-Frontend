import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LoadingError } from './LoadingError';

const SUBJECTS = ['matematicas', 'ciencias', 'sociales', 'lenguaje', 'ingles'];
const INTERESTS = ['Conceptos básicos', 'Problemas prácticos', 'Teoría avanzada', 'Aplicaciones reales'];
const QUESTIONS_PER_SESSION = 10;

export function PracticeSection() {
  const {
    questions,
    currentQuestion,
    progress,
    chatHistory,
    loading,
    error,
    fetchQuestions,
    fetchProgress,
    sendChatMessage
  } = useApp();

  // Estado principal
  const [selectedSubject, setSelectedSubject] = useState('matematicas');
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState('facil');
  const [feedback, setFeedback] = useState(null);
  const [studentInterests, setStudentInterests] = useState([]);
  const [showInterestsForm, setShowInterestsForm] = useState(true);
  const [chatMessages, setChatMessages] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionState, setSessionState] = useState('initial'); // 'initial', 'chatting', 'completed'
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0,
    averageResponseTime: 0
  });

  // Inicializar sesión
  useEffect(() => {
    if (sessionState === 'initial') {
      setSessionStartTime(Date.now());
      setSessionStats({
        correctAnswers: 0,
        incorrectAnswers: 0,
        timeSpent: 0,
        averageResponseTime: 0
      });
    }
  }, [sessionState]);

  // Actualizar dificultad basada en el progreso
  useEffect(() => {
    if (progress?.subjectProgress) {
      const subjectProgress = progress.subjectProgress.find(sp => sp.subject === selectedSubject);
      if (subjectProgress) {
        setCurrentDifficulty(subjectProgress.currentDifficulty);
      }
    }
  }, [progress, selectedSubject]);

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
      averageResponseTime: sessionStats.averageResponseTime
    };
  }, [sessionStats]);

  const handleSubjectChange = useCallback((subject) => {
    setSelectedSubject(subject);
    setShowExplanation(false);
    setUserAnswer('');
    setFeedback(null);
    setScore(0);
    setAnsweredQuestions([]);
    setShowInterestsForm(true);
    setChatMessages([]);
    setSessionState('initial');
    setSessionStartTime(Date.now());
  }, []);

  const handleInterestsSubmit = async (interests) => {
    setIsSubmitting(true);
    setStudentInterests(interests);
    setShowInterestsForm(false);
    
    try {
      const response = await fetch('/api/chat/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: selectedSubject,
          interests: interests
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al iniciar el chat');
      }
      
      const data = await response.json();
      setChatMessages(data.chatHistory);
      setSessionState('chatting');
      
      // Actualizar dificultad si es necesario
      if (data.userProgress?.currentDifficulty) {
        setCurrentDifficulty(data.userProgress.currentDifficulty);
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      setFeedback('Error al iniciar el chat. Intenta de nuevo.');
      setShowInterestsForm(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    setIsSubmitting(true);
    const startTime = Date.now();
    
    try {
      const response = await fetch(`/api/chat/message/${currentQuestion._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userAnswer,
          timeSpent: startTime - sessionStartTime
        })
      });
      
      if (!response.ok) {
        throw new Error('Error al enviar la respuesta');
      }
      
      const data = await response.json();
      setChatMessages(data.chatHistory);
      
      const timeSpent = Date.now() - startTime;
      const isCorrect = data.isCorrect;
      
      // Actualizar estadísticas de la sesión
      setSessionStats(prev => {
        const newStats = {
          ...prev,
          [isCorrect ? 'correctAnswers' : 'incorrectAnswers']: prev[isCorrect ? 'correctAnswers' : 'incorrectAnswers'] + 1,
          timeSpent: prev.timeSpent + timeSpent,
          averageResponseTime: (prev.averageResponseTime * (prev.correctAnswers + prev.incorrectAnswers) + timeSpent) / 
            (prev.correctAnswers + prev.incorrectAnswers + 1)
        };
        return newStats;
      });

      if (isCorrect) {
        setScore(prev => prev + 1);
        setFeedback('¡Correcto!');
      } else {
        setFeedback('Incorrecto. Sigue intentando.');
      }
      
      setShowExplanation(true);
      setAnsweredQuestions(prev => [...prev, currentQuestion._id]);
      
      // Verificar si la sesión está completa
      if (answeredQuestions.length + 1 >= QUESTIONS_PER_SESSION) {
        setSessionState('completed');
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback('Error al enviar la respuesta. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = useCallback(() => {
    setShowExplanation(false);
    setUserAnswer('');
    setFeedback(null);
    setChatMessages([]);
    setShowInterestsForm(true);
    setSessionState('initial');
    setSessionStartTime(Date.now());
    fetchQuestions(selectedSubject, currentDifficulty);
  }, [selectedSubject, currentDifficulty, fetchQuestions]);

  const renderInterestsForm = () => (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold mb-4">¿Qué temas te interesan en {selectedSubject}?</h3>
      <div className="grid grid-cols-2 gap-4">
        {INTERESTS.map((interest) => (
          <button
            key={interest}
            onClick={() => handleInterestsSubmit([interest])}
            className="p-4 border rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            {interest}
          </button>
        ))}
      </div>
      <div className="mt-4">
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          placeholder="O escribe tus propios intereses..."
          className="w-full p-3 border rounded-md"
          rows="3"
          disabled={isSubmitting}
        />
        <button
          onClick={() => handleInterestsSubmit(userAnswer.split(',').map(i => i.trim()))}
          disabled={isSubmitting || !userAnswer.trim()}
          className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
        >
          {isSubmitting ? 'Cargando...' : 'Comenzar'}
        </button>
      </div>
    </div>
  );

  const renderQuestion = () => (
    <>
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-4">{currentQuestion.questionText}</h3>
        
        {feedback && (
          <div className={`mb-4 p-3 rounded ${
            feedback.includes('Correcto') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {feedback}
          </div>
        )}

        <div className="space-y-4">
          {currentQuestion.options.map((option, index) => (
            <div
              key={index}
              className={`p-3 rounded border ${
                showExplanation
                  ? option.isCorrect
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200'
                  : 'border-gray-200 hover:border-blue-500'
              }`}
            >
              {option.text}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
          {chatMessages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.role === 'assistant' ? 'text-blue-600' : 'text-gray-800'
              }`}
            >
              <strong>{msg.role === 'assistant' ? 'Tutor: ' : 'Tú: '}</strong>
              {msg.content}
            </div>
          ))}
        </div>

        {!showExplanation ? (
          <div className="mt-6">
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Escribe tu respuesta aquí..."
              className="w-full p-3 border rounded-md"
              rows="3"
              disabled={isSubmitting}
            />
            <button
              onClick={handleAnswerSubmit}
              disabled={isSubmitting || !userAnswer.trim()}
              className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-semibold mb-2">Explicación:</h4>
              <p>{currentQuestion.explanation}</p>
            </div>
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Siguiente Pregunta
            </button>
          </div>
        )}
      </div>
    </>
  );

  const renderCompletion = () => (
    <div className="text-center py-8">
      <h3 className="text-2xl font-bold mb-4">¡Felicidades!</h3>
      <p className="text-lg mb-6">Has completado todas las preguntas de {selectedSubject}.</p>
      <div className="space-y-4">
        <p>Puntuación final: {score}/{QUESTIONS_PER_SESSION}</p>
        <p>Precisión: {sessionMetrics.accuracy.toFixed(1)}%</p>
        <p>Tiempo total: {sessionMetrics.timeSpentMinutes} minutos</p>
        <p>Tiempo promedio por respuesta: {Math.round(sessionMetrics.averageResponseTime / 1000)} segundos</p>
        <p>Nivel de dificultad alcanzado: {currentDifficulty}</p>
        <button
          onClick={() => handleSubjectChange(selectedSubject)}
          className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Practice Section</h2>
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            {SUBJECTS.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
                className={`px-4 py-2 rounded ${
                  selectedSubject === subject
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {subject.charAt(0).toUpperCase() + subject.slice(1)}
              </button>
            ))}
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">Score: {score}</p>
            <p className="text-sm text-gray-600">Dificultad: {currentDifficulty}</p>
          </div>
        </div>
      </div>

      <LoadingError
        loading={loading.questions}
        error={error.questions}
        onRetry={() => fetchQuestions(selectedSubject, currentDifficulty)}
      >
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {sessionState === 'initial' && renderInterestsForm()}
            {sessionState === 'chatting' && renderQuestion()}
            {sessionState === 'completed' && renderCompletion()}
          </div>
        )}
      </LoadingError>

      <LoadingError
        loading={loading.progress}
        error={error.progress}
        onRetry={fetchProgress}
      >
        {progress && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4">Tu Progreso</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">Racha Actual</p>
                <p className="text-2xl font-bold">{progress.currentStreak} días</p>
              </div>
              <div>
                <p className="text-gray-600">Mejor Racha</p>
                <p className="text-2xl font-bold">{progress.longestStreak} días</p>
              </div>
              {progress.statistics && (
                <>
                  <div>
                    <p className="text-gray-600">Precisión Promedio</p>
                    <p className="text-2xl font-bold">{progress.statistics.averageAccuracy.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Mejor Materia</p>
                    <p className="text-2xl font-bold">{progress.statistics.bestSubject?.subject || '-'}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </LoadingError>
    </div>
  );
} 
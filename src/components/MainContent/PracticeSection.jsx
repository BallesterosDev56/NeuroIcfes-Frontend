import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BrainCircuit } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LoadingError } from '../LoadingError';

const SUBJECTS = ['matematicas', 'ciencias', 'sociales', 'lenguaje', 'ingles'];
const QUESTIONS_PER_SESSION = 10;

const PracticeSection = () => {
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

  // Estado principal
  const [selectedSubject, setSelectedSubject] = useState('matematicas');
  const [userAnswer, setUserAnswer] = useState('');
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState('facil');
  const [feedback, setFeedback] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionState, setSessionState] = useState('chatting'); // 'chatting', 'completed'
  const [sessionStartTime, setSessionStartTime] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    correctAnswers: 0,
    incorrectAnswers: 0,
    timeSpent: 0,
    averageResponseTime: 0
  });

  // Inicializar sesión
  useEffect(() => {
    setSessionStartTime(Date.now());
    setSessionStats({
      correctAnswers: 0,
      incorrectAnswers: 0,
      timeSpent: 0,
      averageResponseTime: 0
    });
    
    // Iniciar la sesión con la materia seleccionada
    const startSession = async () => {
      try {
        await startOpenAIChat(selectedSubject, ['General']);
      } catch (error) {
        console.error('Error starting chat:', error);
        setFeedback('Error al iniciar el chat. Intenta de nuevo.');
      }
    };
    
    startSession();
  }, [selectedSubject, startOpenAIChat]);

  // Actualizar dificultad basada en el progreso
  useEffect(() => {
    if (progress?.subjectProgress) {
      const subjectProgress = progress.subjectProgress.find(sp => sp.subject === selectedSubject);
      if (subjectProgress) {
        setCurrentDifficulty(subjectProgress.currentDifficulty);
      }
    }
  }, [progress, selectedSubject]);

  // Watch for correct answers from OpenAI and update UI state
  useEffect(() => {
    if (openaiChat.isCorrect && !showExplanation) {
      setShowExplanation(true);
      setScore(prevScore => prevScore + 1);
      setFeedback('¡Correcto!');
      
      // Update session stats
      setSessionStats(prev => {
        const timeSpent = Date.now() - sessionStartTime;
        return {
          ...prev,
          correctAnswers: prev.correctAnswers + 1,
          timeSpent: prev.timeSpent + timeSpent,
          averageResponseTime: (prev.averageResponseTime * (prev.correctAnswers + prev.incorrectAnswers) + timeSpent) / 
            (prev.correctAnswers + prev.incorrectAnswers + 1)
        };
      });
      
      // Add question to answered list
      if (currentQuestion && currentQuestion._id) {
        setAnsweredQuestions(prev => [...prev, currentQuestion._id]);
      }
    }
  }, [openaiChat.isCorrect, showExplanation, sessionStartTime, currentQuestion]);

  // Watch for no questions available
  useEffect(() => {
    if (openaiChat.noQuestionsAvailable) {
      setFeedback('No hay preguntas disponibles para esta materia y dificultad. Por favor, selecciona otra materia o dificultad.');
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
    setSessionState('chatting');
    setSessionStartTime(Date.now());
    resetOpenAIChat();
  }, [resetOpenAIChat]);

  const handleAnswerSubmit = async () => {
    if (!currentQuestion || !userAnswer.trim()) return;
    
    setIsSubmitting(true);
    const startTime = Date.now();
    const timeSpent = startTime - sessionStartTime;
    
    try {
      // Send message to OpenAI
      await sendOpenAIMessage(currentQuestion._id, userAnswer, timeSpent);
      setUserAnswer('');
      
      // Check if the answer needs to be explicitly checked
      if (userAnswer.length > 50 || userAnswer.includes('?')) {
        // User is probably asking a question or providing a detailed response
        // Don't check for correctness yet
      } else {
        // User might be providing a direct answer, check if it's correct
        await checkOpenAIAnswer(currentQuestion._id, userAnswer);
      }
    } catch (error) {
      console.error('Error submitting answer:', error);
      setFeedback('Error al enviar la respuesta. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = useCallback(async () => {
    setShowExplanation(false);
    setUserAnswer('');
    setFeedback(null);
    setSessionStartTime(Date.now());
    setIsSubmitting(true);
    
    try {
      // Check if we've reached the maximum number of questions
      if (answeredQuestions.length >= QUESTIONS_PER_SESSION) {
        setSessionState('completed');
        return;
      }
      
      // Get the next question
      const response = await getNextOpenAIQuestion(selectedSubject, currentDifficulty);
      
      if (response.noQuestionsAvailable) {
        setFeedback('No hay más preguntas disponibles para esta materia y dificultad.');
        setSessionState('completed');
      } else {
        setSessionState('chatting');
      }
    } catch (error) {
      console.error('Error getting next question:', error);
      setFeedback('Error al obtener la siguiente pregunta. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSubject, currentDifficulty, getNextOpenAIQuestion, answeredQuestions.length]);

  const renderQuestion = () => (
    <div className="space-y-6">
      <div className="mb-6">
        {currentQuestion && (
          <>
            <h3 className="text-lg font-medium text-gray-900 mb-4">{currentQuestion.questionText}</h3>
            
            {feedback && (
              <div className={`mb-4 p-3 rounded ${
                feedback.includes('Correcto') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {feedback}
              </div>
            )}

            {showExplanation && (
              <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                <h4 className="font-medium text-indigo-900 mb-2">Explicación:</h4>
                <p className="text-indigo-700">{currentQuestion.explanation}</p>
              </div>
            )}
          </>
        )}
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-md max-h-96 overflow-y-auto">
          {openaiChat.messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-4 ${
                msg.role === 'assistant' ? 'text-indigo-600' : 'text-gray-800'
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
              className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Respuesta'}
            </button>
          </div>
        ) : (
          <div className="mt-6">
            <button
              onClick={handleNextQuestion}
              className="mt-4 px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Cargando...' : 'Siguiente Pregunta'}
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const renderCompletion = () => (
    <div className="text-center py-8">
      <h3 className="text-2xl font-bold mb-4">¡Felicidades!</h3>
      <p className="text-lg mb-6">Has completado todas las preguntas de {selectedSubject}.</p>
      <div className="space-y-4">
        <p>Puntuación final: {score}/{answeredQuestions.length}</p>
        <p>Precisión: {sessionMetrics.accuracy.toFixed(1)}%</p>
        <p>Tiempo total: {sessionMetrics.timeSpentMinutes} minutos</p>
        <p>Tiempo promedio por respuesta: {Math.round(sessionMetrics.averageResponseTime / 1000)} segundos</p>
        <p>Nivel de dificultad alcanzado: {currentDifficulty}</p>
        <button
          onClick={() => handleSubjectChange(selectedSubject)}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Reiniciar
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <BrainCircuit className="text-indigo-600" size={24} />
        <h1 className="text-2xl font-bold text-gray-900">Práctica</h1>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-4">
            {SUBJECTS.map((subject) => (
            <button
                key={subject}
                onClick={() => handleSubjectChange(subject)}
                className={`px-4 py-2 rounded ${
                  selectedSubject === subject
                    ? 'bg-indigo-600 text-white'
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
        loading={loading.openai}
        error={error.openai}
        onRetry={() => fetchProgress()}
      >
        <div className="bg-white rounded-xl shadow-sm p-6">
          {sessionState === 'chatting' && renderQuestion()}
          {sessionState === 'completed' && renderCompletion()}
        </div>
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
};

export default PracticeSection; 
import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { LoadingError } from '../LoadingError';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Book,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          ¿Estás seguro de que deseas eliminar esta pregunta?
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          Esta acción no se puede deshacer.
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

const SuccessModal = ({ isOpen, onClose, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          {title}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {message}
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};

const QuestionDashboard = () => {
  const { questions, loading, error, fetchQuestions, createQuestion, updateQuestion, deleteQuestion } = useApp();
  const [selectedSubject, setSelectedSubject] = useState('matematicas');
  const [selectedDifficulty, setSelectedDifficulty] = useState('facil');
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState({
    questionText: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    difficulty: 'facil',
    tags: []
  });

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        console.log('Fetching questions for subject:', selectedSubject, 'difficulty:', selectedDifficulty);
        await fetchQuestions(selectedSubject, selectedDifficulty);
      } catch (error) {
        console.error('Error loading questions:', error);
        setSuccessModal({
          isOpen: true,
          title: 'Error',
          message: 'No se pudieron cargar las preguntas. Por favor, intenta de nuevo.'
        });
      }
    };
    loadQuestions();
  }, [selectedSubject, selectedDifficulty, fetchQuestions]);

  const validateForm = () => {
    const errors = [];
    
    if (!formData.questionText.trim()) {
      errors.push('El texto de la pregunta es requerido');
    }
    
    if (formData.options.some(option => !option.trim())) {
      errors.push('Todas las opciones deben estar completas');
    }
    
    if (formData.options.length !== 4) {
      errors.push('Debe haber exactamente 4 opciones');
    }
    
    if (formData.correctAnswer < 0 || formData.correctAnswer > 3) {
      errors.push('Debe seleccionar una opción correcta válida');
    }
    
    if (!formData.difficulty) {
      errors.push('Debe seleccionar un nivel de dificultad');
    }
    
    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({
      ...prev,
      options: newOptions
    }));
  };

  const handleCorrectAnswerChange = (index) => {
    setFormData(prev => ({
      ...prev,
      correctAnswer: index
    }));
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'facil',
      tags: []
    });
    setIsAddingQuestion(false);
    setEditingQuestion(null);
  };

  const handleEdit = (question) => {
    try {
      console.log('Editing question:', question);
      setEditingQuestion(question);
      setFormData({
        questionText: question.questionText,
        options: question.options.map(opt => opt.text),
        correctAnswer: question.options.findIndex(opt => opt.isCorrect),
        difficulty: question.difficulty,
        tags: question.tags || []
      });
      setIsAddingQuestion(true);
    } catch (error) {
      console.error('Error setting up edit form:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al cargar la pregunta para editar.'
      });
    }
  };

  const handleDelete = (question) => {
    try {
      console.log('Preparing to delete question:', question);
      setQuestionToDelete(question);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error('Error preparing delete:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al preparar la eliminación de la pregunta.'
      });
    }
  };

  const handleConfirmDelete = async () => {
    try {
      console.log('Deleting question:', questionToDelete._id);
      await deleteQuestion(questionToDelete._id);
      setSuccessModal({
        isOpen: true,
        title: 'Pregunta eliminada',
        message: 'La pregunta ha sido eliminada exitosamente.'
      });
    } catch (error) {
      console.error('Error deleting question:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al eliminar la pregunta.'
      });
    } finally {
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const validationErrors = validateForm();
      if (validationErrors.length > 0) {
        setSuccessModal({
          isOpen: true,
          title: 'Error de validación',
          message: validationErrors.join('\n')
        });
        return;
      }

      const options = formData.options.map((text, index) => ({
        text: text.trim(),
        isCorrect: index === formData.correctAnswer
      }));

      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length !== 1) {
        setSuccessModal({
          isOpen: true,
          title: 'Error',
          message: 'Debe haber exactamente una opción correcta'
        });
        return;
      }

      const questionData = {
        subject: selectedSubject,
        questionText: formData.questionText.trim(),
        options,
        difficulty: formData.difficulty,
        tags: formData.tags || []
      };

      if (editingQuestion) {
        console.log('Updating question:', editingQuestion._id, questionData);
        await updateQuestion(editingQuestion._id, questionData);
        setSuccessModal({
          isOpen: true,
          title: 'Pregunta actualizada',
          message: 'La pregunta ha sido actualizada exitosamente.'
        });
      } else {
        console.log('Creating new question:', questionData);
        await createQuestion(questionData);
        setSuccessModal({
          isOpen: true,
          title: 'Pregunta creada',
          message: 'La pregunta ha sido creada exitosamente.'
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving question:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al guardar la pregunta. Por favor, verifica todos los campos.'
      });
    }
  };

  if (loading.questions) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error.questions) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                {error.questions}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => fetchQuestions(selectedSubject, selectedDifficulty)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Preguntas</h2>
        <button
          onClick={() => setIsAddingQuestion(true)}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nueva Pregunta
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Materia
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="matematicas">Matemáticas</option>
            <option value="ciencias">Ciencias</option>
            <option value="sociales">Sociales</option>
            <option value="lectura">Lectura Crítica</option>
            <option value="ingles">Inglés</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dificultad
          </label>
          <select
            value={selectedDifficulty}
            onChange={(e) => setSelectedDifficulty(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="facil">Fácil</option>
            <option value="medio">Medio</option>
            <option value="dificil">Difícil</option>
          </select>
        </div>
      </div>

      {isAddingQuestion ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pregunta
                </label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Escribe la pregunta aquí..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opciones
                </label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="correctAnswer"
                      checked={formData.correctAnswer === index}
                      onChange={() => handleCorrectAnswerChange(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <input
                      type="text"
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      className="ml-2 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder={`Opción ${index + 1}`}
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dificultad
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  {editingQuestion ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {questions && questions.length > 0 ? (
            questions.map((question) => (
              <li key={question._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{question.questionText}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <span className="mr-4">Dificultad: {question.difficulty}</span>
                      <span>Materia: {question.subject}</span>
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(question)}
                      className="p-2 text-blue-600 hover:text-blue-900"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question)}
                      className="p-2 text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-6 py-8 text-center">
              <div className="flex flex-col items-center">
                <Book className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No hay preguntas disponibles para esta materia y dificultad.</p>
                <button
                  onClick={() => setIsAddingQuestion(true)}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Nueva Pregunta
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default QuestionDashboard;
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
  CheckCircle,
  AlertCircle,
  AlertTriangle
} from 'lucide-react';

const Modal = ({ isOpen, onClose, title, message, type = 'confirm', onConfirm }) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-center mb-4">
          {isSuccess ? (
            <CheckCircle className="h-12 w-12 text-green-500" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-yellow-500" />
          )}
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        <div className="flex justify-end space-x-3">
          {!isSuccess && (
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancelar
            </button>
          )}
          <button
            onClick={isSuccess ? onClose : onConfirm}
            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isSuccess 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            {isSuccess ? 'Aceptar' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
};

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
    fetchQuestions(selectedSubject, 'all');
  }, [selectedSubject, fetchQuestions]);

  const subjects = [
    { key: 'matematicas', label: 'Matemáticas' },
    { key: 'ciencias', label: 'Ciencias Naturales' },
    { key: 'lenguaje', label: 'Lectura Crítica' },
    { key: 'sociales', label: 'Ciencias Sociales' },
    { key: 'ingles', label: 'Inglés' }
  ];

  const validateForm = () => {
    const errors = [];

    if (!formData.questionText.trim()) {
      errors.push('La pregunta no puede estar vacía');
    }

    if (formData.questionText.length < 10) {
      errors.push('La pregunta debe tener al menos 10 caracteres');
    }

    const emptyOptions = formData.options.filter(option => !option.trim());
    if (emptyOptions.length > 0) {
      errors.push('Todas las opciones deben estar completas');
    }

    if (formData.options.some(option => option.length < 3)) {
      errors.push('Cada opción debe tener al menos 3 caracteres');
    }

    if (formData.correctAnswer === undefined || formData.correctAnswer === null) {
      errors.push('Debes seleccionar una respuesta correcta');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      return;
    }

    try {
      const options = formData.options.map((text, index) => ({
        text: text.trim(),
        isCorrect: index === formData.correctAnswer
      }));

      const correctOptions = options.filter(opt => opt.isCorrect);
      if (correctOptions.length !== 1) {
        alert('Debe haber exactamente una opción correcta');
        return;
      }

      const questionData = {
        subject: selectedSubject,
        questionText: formData.questionText.trim(),
        options: formData.options.map((text, index) => ({
          text: text.trim(),
          isCorrect: index === formData.correctAnswer
        })),
        difficulty: formData.difficulty,
        tags: formData.tags || []
      };

      if (editingQuestion) {
        await updateQuestion(editingQuestion._id, questionData);
        setSuccessModal({
          isOpen: true,
          title: 'Pregunta actualizada',
          message: 'La pregunta ha sido actualizada exitosamente.'
        });
      } else {
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
      alert('Error al guardar la pregunta. Por favor, verifica todos los campos.');
    }
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      questionText: question.questionText,
      options: question.options.map(opt => opt.text),
      correctAnswer: question.options.findIndex(opt => opt.isCorrect),
      difficulty: question.difficulty,
      tags: question.tags
    });
    setIsAddingQuestion(true);
  };

  const handleDelete = async (questionId) => {
    setQuestionToDelete(questionId);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      await deleteQuestion(questionToDelete);
      setDeleteModalOpen(false);
      setQuestionToDelete(null);
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error al eliminar la pregunta. Por favor, intenta nuevamente.');
    }
  };

  const resetForm = () => {
    setFormData({
      questionText: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      difficulty: 'facil',
      tags: []
    });
    setEditingQuestion(null);
    setIsAddingQuestion(false);
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Preguntas</h1>
        <div className="flex gap-4">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            {subjects.map(subject => (
              <option key={subject.key} value={subject.key}>
                {subject.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setIsAddingQuestion(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nueva Pregunta
          </button>
        </div>
      </div>

      <LoadingError
        loading={loading.questions}
        error={error.questions}
        onRetry={() => fetchQuestions(selectedSubject, 'all')}
      >
        {isAddingQuestion && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                {editingQuestion ? 'Editar Pregunta' : 'Nueva Pregunta'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pregunta
                </label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                  minLength={10}
                  placeholder="Escribe la pregunta aquí (mínimo 10 caracteres)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Opciones
                </label>
                <div className="mt-2 space-y-2">
                  {formData.options.map((option, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => handleCorrectAnswerChange(index)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        required
                      />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        placeholder={`Opción ${index + 1} (mínimo 3 caracteres)`}
                        required
                        minLength={3}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Dificultad
                </label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                >
                  <option value="facil">Fácil</option>
                  <option value="medio">Medio</option>
                  <option value="dificil">Difícil</option>
                </select>
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <Save className="h-5 w-5 mr-2" />
                  {editingQuestion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pregunta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Materia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dificultad
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {questions.map((question) => (
                <tr key={question._id}>
                  <td className="px-6 py-4 whitespace-normal">
                    <div className="text-sm text-gray-900">{question.questionText}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {subjects.find(s => s.key === question.subject)?.label || question.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${question.difficulty === 'facil' ? 'bg-green-100 text-green-800' : 
                        question.difficulty === 'medio' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {question.difficulty === 'facil' ? 'Fácil' : 
                       question.difficulty === 'medio' ? 'Medio' : 'Difícil'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(question)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(question._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </LoadingError>
    </div>
  );
};

export default QuestionDashboard; 
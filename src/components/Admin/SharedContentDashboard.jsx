import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X,
  FileText,
  Image,
  BarChart4,
  Layers,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';

// Componente de Modal de Confirmación para Eliminación
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, contentTitle, hasQuestions }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        <div className="flex items-center justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-yellow-500" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
          {hasQuestions 
            ? "No se puede eliminar este contenido" 
            : `¿Estás seguro de que deseas eliminar "${contentTitle}"?`}
        </h3>
        <p className="text-sm text-gray-500 text-center mb-6">
          {hasQuestions 
            ? "Este contenido tiene preguntas asociadas. Debes eliminar o reasignar esas preguntas antes de eliminar este contenido."
            : "Esta acción no se puede deshacer."}
        </p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {hasQuestions ? "Entendido" : "Cancelar"}
          </button>
          {!hasQuestions && (
            <button
              onClick={onConfirm}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Componente de Modal de Éxito
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

// Componente principal del Dashboard de Contenido Compartido
const SharedContentDashboard = () => {
  // Estados del componente
  const { 
    sharedContents, 
    loading, 
    error, 
    fetchSharedContents,
    fetchSharedContentById,
    createSharedContent,
    updateSharedContent,
    deleteSharedContent
  } = useApp();
  
  const [selectedSubject, setSelectedSubject] = useState('matematicas');
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [contentToDelete, setContentToDelete] = useState(null);
  const [hasAssociatedQuestions, setHasAssociatedQuestions] = useState(false);
  const [successModal, setSuccessModal] = useState({
    isOpen: false,
    title: '',
    message: ''
  });
  const [formData, setFormData] = useState({
    contentType: 'text',
    title: '',
    textContent: '',
    mediaUrl: '',
    imageDescription: '',
    imageElements: [],
    subject: 'matematicas',
    difficulty: 'facil'
  });

  // Cargar contenidos compartidos al cambiar de materia
  useEffect(() => {
    const loadSharedContents = async () => {
      try {
        await fetchSharedContents(selectedSubject);
      } catch (error) {
        console.error('Error loading shared contents:', error);
        setSuccessModal({
          isOpen: true,
          title: 'Error',
          message: 'No se pudieron cargar los contenidos compartidos. Por favor, intenta de nuevo.'
        });
      }
    };
    loadSharedContents();
  }, [selectedSubject, fetchSharedContents]);

  // Filtrar contenidos por la materia seleccionada
  const filteredContents = sharedContents?.filter(
    content => !selectedSubject || content.subject === selectedSubject
  ) || [];

  // Función para obtener icono según tipo de contenido
  const getContentTypeIcon = (type) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'image':
        return <Image className="h-5 w-5 text-green-500" />;
      case 'graph':
        return <BarChart4 className="h-5 w-5 text-purple-500" />;
      case 'mixed':
        return <Layers className="h-5 w-5 text-amber-500" />;
      default:
        return <Info className="h-5 w-5 text-gray-500" />;
    }
  };

  // Función para manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Función para manejar cambios en los elementos de imagen
  const handleImageElementChange = (index, field, value) => {
    const updatedElements = [...formData.imageElements];
    
    // Si el elemento no existe, crearlo
    if (!updatedElements[index]) {
      updatedElements[index] = { elementId: index + 1, description: '', coordinates: '' };
    }
    
    updatedElements[index][field] = value;
    
    setFormData(prev => ({
      ...prev,
      imageElements: updatedElements
    }));
  };

  // Función para añadir un nuevo elemento de imagen
  const addImageElement = () => {
    const newIndex = formData.imageElements.length;
    setFormData(prev => ({
      ...prev,
      imageElements: [
        ...prev.imageElements,
        { elementId: newIndex + 1, description: '', coordinates: '' }
      ]
    }));
  };

  // Función para eliminar un elemento de imagen
  const removeImageElement = (index) => {
    const filteredElements = formData.imageElements.filter((_, i) => i !== index)
      .map((el, i) => ({ ...el, elementId: i + 1 })); // Reindexar IDs
    
    setFormData(prev => ({
      ...prev,
      imageElements: filteredElements
    }));
  };

  // Validación del formulario
  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) {
      errors.push('El título es requerido');
    }
    
    if (!formData.subject) {
      errors.push('La materia es requerida');
    }
    
    if (!formData.difficulty) {
      errors.push('La dificultad es requerida');
    }
    
    if (formData.contentType === 'text' && !formData.textContent.trim()) {
      errors.push('El contenido de texto es requerido para tipo "texto"');
    }
    
    if ((formData.contentType === 'image' || formData.contentType === 'mixed') && !formData.mediaUrl) {
      errors.push('La URL de la imagen es requerida para tipos "imagen" o "mixto"');
    }
    
    if ((formData.contentType === 'image' || formData.contentType === 'mixed') && !formData.imageDescription) {
      errors.push('La descripción de la imagen es requerida para tipos "imagen" o "mixto"');
    }
    
    return errors;
  };

  // Función para limpiar el formulario
  const resetForm = () => {
    setFormData({
      contentType: 'text',
      title: '',
      textContent: '',
      mediaUrl: '',
      imageDescription: '',
      imageElements: [],
      subject: selectedSubject,
      difficulty: 'facil'
    });
    setIsEditing(false);
    setCurrentContent(null);
  };

  // Función para iniciar la edición de un contenido
  const handleEdit = (content) => {
    setCurrentContent(content);
    setFormData({
      contentType: content.contentType,
      title: content.title,
      textContent: content.textContent || '',
      mediaUrl: content.mediaUrl || '',
      imageDescription: content.imageDescription || '',
      imageElements: content.imageElements || [],
      subject: content.subject,
      difficulty: content.difficulty
    });
    setIsEditing(true);
  };

  // Función para iniciar la eliminación de un contenido
  const handleDelete = async (content) => {
    setContentToDelete(content);
    
    try {
      // Verificar si el contenido tiene preguntas asociadas
      const contentWithQuestions = await fetchSharedContentById(content._id);
      const hasQuestions = contentWithQuestions.questions && contentWithQuestions.questions.length > 0;
      
      setHasAssociatedQuestions(hasQuestions);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error('Error checking for associated questions:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'No se pudo verificar si el contenido tiene preguntas asociadas.'
      });
    }
  };

  // Función para confirmar la eliminación de un contenido
  const handleConfirmDelete = async () => {
    if (!contentToDelete) return;
    
    try {
      await deleteSharedContent(contentToDelete._id, selectedSubject);
      
      setSuccessModal({
        isOpen: true,
        title: 'Contenido eliminado',
        message: 'El contenido compartido ha sido eliminado exitosamente.'
      });
    } catch (error) {
      console.error('Error deleting content:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al eliminar el contenido: ' + error.message
      });
    } finally {
      setDeleteModalOpen(false);
      setContentToDelete(null);
    }
  };

  // Función para enviar el formulario
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
      
      // Preparar datos para enviar
      const contentData = { ...formData };
      
      if (currentContent) {
        // Actualizar contenido existente
        await updateSharedContent(currentContent._id, contentData);
        setSuccessModal({
          isOpen: true,
          title: 'Contenido actualizado',
          message: 'El contenido compartido ha sido actualizado exitosamente.'
        });
      } else {
        // Crear nuevo contenido
        await createSharedContent(contentData);
        setSuccessModal({
          isOpen: true,
          title: 'Contenido creado',
          message: 'El contenido compartido ha sido creado exitosamente.'
        });
      }
      
      // Reiniciar formulario
      resetForm();
    } catch (error) {
      console.error('Error saving content:', error);
      setSuccessModal({
        isOpen: true,
        title: 'Error',
        message: 'Error al guardar el contenido: ' + error.message
      });
    }
  };

  // Renderizar cargando
  if (loading.sharedContent) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        contentTitle={contentToDelete?.title}
        hasQuestions={hasAssociatedQuestions}
      />
      <SuccessModal
        isOpen={successModal.isOpen}
        onClose={() => setSuccessModal(prev => ({ ...prev, isOpen: false }))}
        title={successModal.title}
        message={successModal.message}
      />
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Gestión de Contenido Compartido</h2>
        <button
          onClick={() => {
            resetForm();
            setFormData(prev => ({ ...prev, subject: selectedSubject }));
            setIsEditing(true);
          }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nuevo Contenido
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Filtrar por Materia
        </label>
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
        >
          <option value="matematicas">Matemáticas</option>
          <option value="ciencias">Ciencias</option>
          <option value="sociales">Sociales</option>
          <option value="lenguaje">Lenguaje</option>
          <option value="ingles">Inglés</option>
        </select>
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {currentContent ? 'Editar Contenido' : 'Nuevo Contenido'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tipo de contenido */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Contenido
              </label>
              <select
                name="contentType"
                value={formData.contentType}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="text">Texto</option>
                <option value="image">Imagen</option>
                <option value="graph">Gráfico</option>
                <option value="mixed">Mixto (Texto e Imagen)</option>
              </select>
            </div>

            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ingrese un título descriptivo"
              />
            </div>

            {/* Materia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Materia
              </label>
              <select
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="matematicas">Matemáticas</option>
                <option value="ciencias">Ciencias</option>
                <option value="sociales">Sociales</option>
                <option value="lenguaje">Lenguaje</option>
                <option value="ingles">Inglés</option>
              </select>
            </div>

            {/* Dificultad */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
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

            {/* Campos específicos según el tipo de contenido */}
            {(formData.contentType === 'text' || formData.contentType === 'mixed') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contenido de Texto
                </label>
                <textarea
                  name="textContent"
                  value={formData.textContent}
                  onChange={handleInputChange}
                  rows={6}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingrese el texto completo"
                />
              </div>
            )}

            {(formData.contentType === 'image' || formData.contentType === 'graph' || formData.contentType === 'mixed') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL de la Imagen
                  </label>
                  <input
                    type="text"
                    name="mediaUrl"
                    value={formData.mediaUrl}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ingrese la URL de la imagen"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción de la Imagen
                  </label>
                  <textarea
                    name="imageDescription"
                    value={formData.imageDescription}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Describa detalladamente el contenido de la imagen"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Esta descripción es importante para la accesibilidad y para que la IA pueda interpretar la imagen.
                  </p>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Elementos Interactivos
                    </label>
                    <button
                      type="button"
                      onClick={addImageElement}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      + Añadir elemento
                    </button>
                  </div>
                  
                  {formData.imageElements.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No hay elementos interactivos definidos. Los elementos permiten a los usuarios hacer clic en áreas específicas de la imagen.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {formData.imageElements.map((element, index) => (
                        <div key={index} className="flex items-start space-x-2 p-3 bg-gray-50 rounded-md">
                          <div className="flex-shrink-0 h-6 w-6 flex items-center justify-center bg-blue-600 text-white rounded-full">
                            {element.elementId}
                          </div>
                          <div className="flex-grow space-y-2">
                            <input
                              type="text"
                              value={element.description}
                              onChange={(e) => handleImageElementChange(index, 'description', e.target.value)}
                              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder="Descripción del elemento"
                            />
                            <select
                              value={element.coordinates}
                              onChange={(e) => handleImageElementChange(index, 'coordinates', e.target.value)}
                              className="w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                            >
                              <option value="">Seleccione posición</option>
                              <option value="superior-izquierda">Superior Izquierda</option>
                              <option value="superior-centro">Superior Centro</option>
                              <option value="superior-derecha">Superior Derecha</option>
                              <option value="centro-izquierda">Centro Izquierda</option>
                              <option value="centro">Centro</option>
                              <option value="centro-derecha">Centro Derecha</option>
                              <option value="inferior-izquierda">Inferior Izquierda</option>
                              <option value="inferior-centro">Inferior Centro</option>
                              <option value="inferior-derecha">Inferior Derecha</option>
                            </select>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImageElement(index)}
                            className="flex-shrink-0 text-red-500 hover:text-red-700"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            <div className="flex justify-end space-x-3 pt-4">
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
                {currentContent ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredContents.length > 0 ? (
            filteredContents.map((content) => (
              <li key={content._id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="mr-3">
                        {getContentTypeIcon(content.contentType)}
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{content.title}</h3>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <span className="capitalize mr-2">{content.subject}</span>
                          <span>•</span>
                          <span className="capitalize ml-2">{content.difficulty}</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      {content.contentType === 'text' && (
                        <p className="line-clamp-2">{content.textContent}</p>
                      )}
                      {content.contentType === 'image' && content.imageDescription && (
                        <p className="line-clamp-2">{content.imageDescription}</p>
                      )}
                      {content.imageElements && content.imageElements.length > 0 && (
                        <div className="mt-1">
                          <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                            {content.imageElements.length} elementos interactivos
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex space-x-2">
                    <button
                      onClick={() => handleEdit(content)}
                      className="p-2 text-blue-600 hover:text-blue-900"
                      title="Editar"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(content)}
                      className="p-2 text-red-600 hover:text-red-900"
                      title="Eliminar"
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
                <FileText className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 mb-2">No hay contenidos compartidos para esta materia.</p>
                <button
                  onClick={() => {
                    resetForm();
                    setFormData(prev => ({ ...prev, subject: selectedSubject }));
                    setIsEditing(true);
                  }}
                  className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Crear Nuevo Contenido
                </button>
              </div>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default SharedContentDashboard; 
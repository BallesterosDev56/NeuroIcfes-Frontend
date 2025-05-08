const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SharedContentService {
  /**
   * Obtener todos los contenidos compartidos
   * @param {string} subject - Opcional: filtrar por materia
   * @returns {Promise<Array>} - Lista de contenidos compartidos
   */
  async getAll(subject = null) {
    try {
      let url = `${API_URL}/shared-content`;
      if (subject) {
        url += `?subject=${subject}`;
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo contenidos compartidos:', error);
      throw error;
    }
  }

  /**
   * Obtener un contenido compartido específico con sus preguntas
   * @param {string} id - ID del contenido compartido
   * @returns {Promise<Object>} - Contenido compartido con sus preguntas
   */
  async getById(id) {
    try {
      const response = await fetch(`${API_URL}/shared-content/${id}`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo contenido compartido:', error);
      throw error;
    }
  }

  /**
   * Obtener todas las preguntas asociadas a un contenido compartido
   * @param {string} id - ID del contenido compartido
   * @returns {Promise<Array>} - Lista de preguntas
   */
  async getQuestions(id) {
    try {
      const response = await fetch(`${API_URL}/shared-content/${id}/questions`, {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error obteniendo preguntas del contenido compartido:', error);
      throw error;
    }
  }

  // Métodos para administradores

  /**
   * Crear un nuevo contenido compartido (solo admin)
   * @param {Object} data - Datos del contenido compartido
   * @returns {Promise<Object>} - Contenido compartido creado
   */
  async create(data) {
    try {
      const response = await fetch(`${API_URL}/shared-content`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creando contenido compartido:', error);
      throw error;
    }
  }

  /**
   * Actualizar un contenido compartido (solo admin)
   * @param {string} id - ID del contenido compartido
   * @param {Object} data - Datos actualizados
   * @returns {Promise<Object>} - Contenido compartido actualizado
   */
  async update(id, data) {
    try {
      const response = await fetch(`${API_URL}/shared-content/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error actualizando contenido compartido:', error);
      throw error;
    }
  }

  /**
   * Eliminar un contenido compartido (solo admin)
   * @param {string} id - ID del contenido compartido
   * @returns {Promise<Object>} - Respuesta de confirmación
   */
  async delete(id) {
    try {
      const response = await fetch(`${API_URL}/shared-content/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(await response.text());
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error eliminando contenido compartido:', error);
      throw error;
    }
  }
}

export const sharedContentService = new SharedContentService();
export default sharedContentService; 
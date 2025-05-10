const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Servicio para gestionar la carga de archivos
 */
class UploadService {
  /**
   * Subir una imagen al servidor
   * @param {File} imageFile - Archivo de imagen a subir
   * @returns {Promise<Object>} - Información de la imagen subida
   */
  async uploadImage(imageFile) {
    try {
      if (!imageFile) {
        throw new Error('No se ha proporcionado ninguna imagen');
      }

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(`${API_URL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir la imagen');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en uploadImage:', error);
      throw error;
    }
  }

  /**
   * Eliminar una imagen del servidor
   * @param {string} publicId - ID público de la imagen en Cloudinary
   * @returns {Promise<Object>} - Respuesta del servidor
   */
  async deleteImage(publicId) {
    try {
      if (!publicId) {
        throw new Error('No se ha proporcionado un ID de imagen');
      }

      const response = await fetch(`${API_URL}/upload/image/${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar la imagen');
      }

      return await response.json();
    } catch (error) {
      console.error('Error en deleteImage:', error);
      throw error;
    }
  }
}

export const uploadService = new UploadService();
export default uploadService; 
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Image, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { uploadService } from '../services/uploadService';

/**
 * Componente para subir imágenes con arrastrar y soltar
 */
const ImageUploader = ({ onImageUpload, existingImageUrl = null, onError = null }) => {
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(existingImageUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Función para manejar archivos soltados
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setImageFile(file);
      setUploadError(null);
      
      // Crear una URL para la vista previa
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
    }
  }, []);

  // Configuración de react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  // Función para subir la imagen
  const handleUpload = async () => {
    if (!imageFile) {
      const errorMsg = 'Por favor, selecciona una imagen primero';
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const result = await uploadService.uploadImage(imageFile);
      setUploadSuccess(true);
      
      // Pasar la información al componente padre
      if (onImageUpload) {
        onImageUpload({
          url: result.url,
          public_id: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height
        });
      }
    } catch (error) {
      console.error('Error al subir imagen:', error);
      const errorMsg = error.message || 'Error al subir la imagen';
      setUploadError(errorMsg);
      if (onError) onError(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  // Limpiar la imagen seleccionada
  const handleClear = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setImageFile(null);
    setPreview(null);
    setUploadError(null);
    setUploadSuccess(false);
  };

  return (
    <div className="space-y-4">
      {/* Área para arrastrar y soltar */}
      <div 
        {...getRootProps()} 
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'}`}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <img 
              src={preview} 
              alt="Vista previa" 
              className="max-h-48 mx-auto rounded"
            />
            <button 
              onClick={(e) => {
                e.stopPropagation();
                handleClear();
              }}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md text-gray-700 hover:text-red-500"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="py-4">
            <Image className="h-12 w-12 mx-auto text-gray-400 mb-2" />
            <p className="text-sm text-gray-600">
              {isDragActive 
                ? 'Suelta la imagen aquí...' 
                : 'Arrastra y suelta una imagen, o haz clic para seleccionar'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              PNG, JPG, GIF hasta 5MB
            </p>
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={handleClear}
          disabled={!imageFile || isUploading}
          className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 
                    hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Limpiar
        </button>
        <button
          type="button"
          onClick={handleUpload}
          disabled={!imageFile || isUploading || uploadSuccess}
          className="px-3 py-1.5 border border-transparent rounded-md text-sm text-white 
                    bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                    flex items-center"
        >
          {isUploading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Subiendo...
            </>
          ) : uploadSuccess ? (
            <>
              <CheckCircle className="h-4 w-4 mr-2" />
              Subida exitosa
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Subir imagen
            </>
          )}
        </button>
      </div>

      {/* Mensaje de error */}
      {uploadError && (
        <div className="text-sm text-red-600 flex items-center mt-2">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {uploadError}
        </div>
      )}
      
      {/* Mensaje de éxito */}
      {uploadSuccess && (
        <div className="text-sm text-green-600 flex items-center mt-2">
          <CheckCircle className="h-4 w-4 mr-1" />
          La imagen se ha subido correctamente
        </div>
      )}
    </div>
  );
};

export default ImageUploader; 
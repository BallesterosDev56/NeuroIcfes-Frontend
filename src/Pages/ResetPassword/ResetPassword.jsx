import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { Mail } from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');
      
      await sendPasswordResetEmail(auth, data.email);
      setSuccessMessage('Se ha enviado un correo electrónico con las instrucciones para restablecer tu contraseña.');
    } catch (error) {
      console.error('Reset password error:', error);
      
      if (error.code === 'auth/user-not-found') {
        setError('No existe una cuenta con este correo electrónico.');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Demasiados intentos. Por favor, espera un momento antes de intentar nuevamente.');
      } else {
        setError('Ha ocurrido un error. Por favor, intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Restablecer Contraseña
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-700 p-3 rounded-md border border-green-200">
            {successMessage}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <InputField
              label="Correo Electrónico"
              type="email"
              id="email"
              placeholder="nombre@ejemplo.com"
              icon={<Mail size={18} className="text-gray-400" />}
              {...register('email', {
                required: 'El correo es obligatorio',
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: 'Ingresa un correo electrónico válido',
                },
              })}
              error={errors.email}
            />
            {errors.email && <ErrorMessage message={errors.email.message} />}
          </div>

          <div>
            <Button
              type="submit"
              variant="primary"
              isFullWidth
              isLoading={isLoading}
              disabled={isLoading}
            >
              Enviar Instrucciones
            </Button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}; 
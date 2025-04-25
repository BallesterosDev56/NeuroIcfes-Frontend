import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { auth } from '../firebase/auth';
import { createUserProfile } from '../../services/userService';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { BrainCircuit, BookCheck, User, Mail, Lock, CheckCircle } from 'lucide-react';

// Components
import Button from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();

  const password = watch('password', '');

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError('');
      const result = await signInWithPopup(auth, googleProvider);
      
      // Create user profile in Firestore with profileCompleted set to false
      await createUserProfile(result.user.uid, {
        displayName: result.user.displayName,
        email: result.user.email,
        photoURL: result.user.photoURL,
        provider: 'google',
        profileCompleted: false // Explicitly set to false for new users
      });
      
      // The ProfileGuard will handle the redirection based on profileCompleted status
      navigate('/home');
    } catch (error) {
      console.error('Google sign in error:', error);
      setAuthError('Error al registrarse con Google. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setAuthError('');
      
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      
      // Update profile with displayName
      await updateProfile(userCredential.user, {
        displayName: data.fullName,
      });

      // Create user profile in Firestore with profileCompleted set to false
      await createUserProfile(userCredential.user.uid, {
        displayName: data.fullName,
        email: data.email,
        provider: 'email',
        profileCompleted: false // Explicitly set to false for new users
      });
      
      // The ProfileGuard will handle the redirection based on profileCompleted status
      navigate('/home');
    } catch (error) {
      console.error('Registration error:', error);
      
      if (error.code === 'auth/email-already-in-use') {
        setAuthError('Este correo electrónico ya está en uso');
      } else if (error.code === 'auth/weak-password') {
        setAuthError('La contraseña es demasiado débil');
      } else {
        setAuthError('Error al crear cuenta. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-indigo-600 md:w-2/5 p-6 flex flex-col justify-center items-center text-white">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <BrainCircuit size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">NeuroICFES</h1>
          <p className="text-xl mb-6">Tu asistente de IA para prepararte para el examen ICFES</p>
          
          <div className="space-y-4">
            <div className="bg-indigo-500 rounded-lg p-6 shadow-lg">
              <div className="flex items-center mb-4">
                <BookCheck className="mr-2" />
                <h2 className="text-lg font-semibold">¿Por qué registrarte?</h2>
              </div>
              <ul className="space-y-2 text-left">
                <li>• Guarda tu progreso de estudio</li>
                <li>• Recibe recomendaciones personalizadas</li>
                <li>• Accede a simulacros completos</li>
                <li>• Estadísticas de tu rendimiento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Register form */}
      <div className="md:w-3/5 p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600">Regístrate para comenzar a prepararte</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
              {authError}
            </div>
          )}

          <form className="mt-6 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4">
              <InputField
                label="Nombre completo"
                type="text"
                id="fullName"
                placeholder="Juan Pérez"
                icon={<User size={18} className="text-gray-400" />}
                {...register('fullName', {
                  required: 'El nombre es obligatorio',
                  minLength: {
                    value: 3,
                    message: 'El nombre debe tener al menos 3 caracteres',
                  },
                })}
                error={errors.fullName}
              />
              {errors.fullName && <ErrorMessage message={errors.fullName.message} />}

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

              <div className="relative">
                <InputField
                  label="Contraseña"
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  icon={<Lock size={18} className="text-gray-400" />}
                  {...register('password', {
                    required: 'La contraseña es obligatoria',
                    minLength: {
                      value: 8,
                      message: 'La contraseña debe tener al menos 8 caracteres',
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                      message: 'La contraseña debe contener mayúsculas, minúsculas, números y al menos un carácter especial',
                    },
                  })}
                  error={errors.password}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.password && <ErrorMessage message={errors.password.message} />}

              <div className="relative">
                <InputField
                  label="Confirmar Contraseña"
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  placeholder="••••••••"
                  icon={<CheckCircle size={18} className="text-gray-400" />}
                  {...register('confirmPassword', {
                    required: 'Confirma tu contraseña',
                    validate: value => value === password || 'Las contraseñas no coinciden',
                  })}
                  error={errors.confirmPassword}
                />
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  tabIndex="-1"
                >
                  {showConfirmPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <ErrorMessage message={errors.confirmPassword.message} />}

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  {...register('terms', {
                    required: 'Debes aceptar los términos y condiciones',
                  })}
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  Acepto los{' '}
                  <Link to="/terms" className="font-medium text-indigo-600 hover:text-indigo-500">
                    Términos y Condiciones
                  </Link>
                </label>
              </div>
              {errors.terms && <ErrorMessage message={errors.terms.message} />}
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                colorScheme="indigo"
                isFullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                Crear Cuenta
              </Button>

              <div className="flex items-center justify-between">
                <div className="w-full border-t border-gray-300" />
                <div className="px-2 text-gray-500 text-sm">o</div>
                <div className="w-full border-t border-gray-300" />
              </div>

              <Button
                type="button"
                variant="outline"
                isFullWidth
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <FaGoogle className="mr-2" />
                Registrarse con Google
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Inicia Sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

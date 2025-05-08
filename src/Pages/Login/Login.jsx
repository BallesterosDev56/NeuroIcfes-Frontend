import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../../firebase/auth';
import { createUserProfile, getUserProfile } from '../../services/userService';
import { FaEye, FaEyeSlash, FaGoogle } from 'react-icons/fa';
import { BrainCircuit, BookOpen, Mail, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Components
import Button from '../../components/ui/Button';
import { InputField } from '../../components/ui/InputField';
import { ErrorMessage } from '../../components/ui/ErrorMessage';

export const Login = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const googleProvider = new GoogleAuthProvider();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setAuthError('');
      console.log("Iniciando proceso de autenticación con Google...");
      const result = await signInWithPopup(auth, googleProvider);
      
      // Get the token and store it
      const token = await result.user.getIdToken();
      console.log("Google auth successful, got token");
      sessionStorage.setItem('token', token);
      
      // For debugging - store user info
      const userData = {
        uid: result.user.uid,
        displayName: result.user.displayName,
        email: result.user.email,
        provider: 'google',
        photoURL: result.user.photoURL
      };
      
      console.log("Información del usuario:", userData);
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      // Check if user profile exists
      let existingProfile = null;
      let isNewUser = false;
      
      try {
        console.log("Verificando si el perfil de usuario existe para:", result.user.uid);
        existingProfile = await getUserProfile(result.user.uid);
        console.log("Perfil existe:", existingProfile);
      } catch (error) {
        // Explicitly handle the "Usuario no encontrado" error or 404 status
        if (error.message.includes('Usuario no encontrado') || 
            error.message.includes('not found') || 
            error.status === 404) {
          console.log('Nuevo usuario detectado, se creará un perfil');
          isNewUser = true;
          // existingProfile remains null
        } else if (error.message.includes('No autorizado') || error.status === 401) {
          console.error('Error de autorización al verificar perfil:', error);
          setAuthError('Error de autorización: El token no es válido o ha expirado.');
          return;
        } else {
          // For other errors, show the error message and stop execution
          console.error('Error inesperado al verificar perfil:', error);
          setAuthError('Error al verificar perfil: ' + error.message);
          throw error;
        }
      }
      
      // For new users, create a profile
      if (isNewUser) {
        try {
          console.log('Creando nuevo perfil de usuario para:', result.user.uid);
          const userDataToSave = {
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            provider: 'google',
            profileCompleted: false // Explicitly set to false for new users
          };
          console.log('Datos de usuario a guardar:', userDataToSave);
          
          console.log('Llamando a createUserProfile...');
          const createdProfile = await createUserProfile(result.user.uid, userDataToSave);
          console.log('Perfil creado exitosamente:', createdProfile);
          
          // Actualizar el contexto con el nuevo perfil
          await setUserProfile({...createdProfile, uid: result.user.uid});
          
          // Redirect to user-info for new users
          navigate('/user-info');
          return;
        } catch (error) {
          console.error('Error al crear perfil de usuario:', error);
          if (error.message.includes('No autorizado') || error.status === 401) {
            setAuthError('Error de autorización: No se pudo crear el perfil porque el token no es válido.');
          } else if (error.message.includes('API endpoint not found') || error.status === 404 || error.name === 'SyntaxError') {
            console.error('Detalles del error:', error);
            setAuthError('Error de servidor: La API no está disponible o el endpoint no existe. Verifique la configuración del backend.');
          } else if (error.message.includes('ya existe')) {
            // Si el usuario ya existe, intentar obtener el perfil nuevamente
            console.log('El usuario ya existe, intentando obtener el perfil...');
            try {
              existingProfile = await getUserProfile(result.user.uid);
              console.log('Perfil recuperado:', existingProfile);
              // Continue to the next section to handle existing profile
            } catch (getError) {
              console.error('Error al recuperar perfil existente:', getError);
              setAuthError('Error al recuperar perfil existente: ' + getError.message);
              return;
            }
          } else {
            setAuthError('Error al crear perfil: ' + error.message);
            return;
          }
        }
      }
      
      // For existing users, check if profile is completed
      if (!existingProfile || !existingProfile.profileCompleted) {
        console.log('Redirigiendo a completar perfil...');
        // Actualizar el contexto con el perfil existente
        await setUserProfile({...existingProfile, uid: result.user.uid});
        // Redirect to user-info if profile exists but is not completed
        navigate('/user-info');
      } else {
        console.log('Perfil completo, redirigiendo a home...', existingProfile);
        // Actualizar el contexto con el perfil existente
        await setUserProfile({...existingProfile, uid: result.user.uid});
        // Redirect to home if profile exists and is completed
        navigate('/home');
      }
    } catch (error) {
      console.error('Error de inicio de sesión con Google:', error);
      
      // Provide more helpful error messages based on the error type
      if (error.name === 'SyntaxError') {
        setAuthError('Error: La respuesta del servidor no es válida. Verifique que el backend esté funcionando correctamente.');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Inicio de sesión cancelado: La ventana de Google fue cerrada.');
      } else if (error.message.includes('API endpoint not found')) {
        setAuthError('Error de conexión: No se puede conectar con el servidor backend.');
      } else {
        setAuthError('Error al iniciar sesión con Google: ' + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      setIsLoading(true);
      setAuthError('');
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      
      // Get the token
      const token = await userCredential.user.getIdToken();
      sessionStorage.setItem('token', token);
      
      // Get user profile to check role
      const userProfile = await getUserProfile(userCredential.user.uid);
      
      // Store user data in sessionStorage
      sessionStorage.setItem('userData', JSON.stringify({
        ...userCredential.user,
        role: userProfile?.role || 'user'
      }));
      
      // Actualizar el contexto con el perfil del usuario
      await setUserProfile({...userProfile, uid: userCredential.user.uid});
      
      if (userProfile?.role === 'admin') {
        navigate('/admin');
      } else if (!userProfile?.profileCompleted) {
        navigate('/user-info');
      } else {
        navigate('/home');
      }
    } catch (error) {
      console.error('Login error:', error);
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setAuthError('Correo o contraseña incorrectos');
      } else if (error.code === 'auth/too-many-requests') {
        setAuthError('Demasiados intentos fallidos. Intenta más tarde o restablece tu contraseña');
      } else {
        setAuthError('Error al iniciar sesión. Intenta de nuevo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Branding */}
      <div className="bg-blue-600 md:w-2/5 p-6 flex flex-col justify-center items-center text-white sm:hidden md:flex">
        <div className="max-w-md mx-auto text-center">
          <div className="flex justify-center mb-6">
            <BrainCircuit size={64} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">NeuroICFES</h1>
          <p className="text-xl mb-6">Tu asistente de IA para prepararte para el examen ICFES</p>
          <div className="bg-blue-500 rounded-lg p-6 shadow-lg">
            <div className="flex items-center mb-4">
              <BookOpen className="mr-2" />
              <h2 className="text-lg font-semibold">Beneficios</h2>
            </div>
            <ul className="space-y-2 text-left">
              <li>• Preparación personalizada según tu nivel</li>
              <li>• Práctica con preguntas tipo ICFES</li>
              <li>• Análisis de fortalezas y debilidades</li>
              <li>• Consejos y estrategias de estudio</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="md:w-3/5 p-6 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Iniciar Sesión</h2>
            <p className="text-gray-600">Accede a tu cuenta para continuar</p>
          </div>

          {authError && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md border border-red-200">
              {authError}
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
                      value: 6,
                      message: 'La contraseña debe tener al menos 6 caracteres',
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
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Recordarme
                </label>
              </div>
              <Link to="/reset-password" className="text-sm font-medium text-blue-600 hover:text-blue-500">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                isFullWidth
                isLoading={isLoading}
                disabled={isLoading}
              >
                Iniciar Sesión
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
                Continuar con Google
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
                Regístrate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import Logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import {
  Brain,
  BookOpen,
  BarChart2,
  ArrowRight,
  MessageCircle,
} from "lucide-react";

export const Introduction = () => {
  // Color principal
  const primaryColor = "#5956FC";
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen relative">
      {/* Círculos decorativos con opacidad - Expanded for mobile */}
      <div className="pointer-events-none absolute top-1/4 left-1/4 w-64 sm:w-64 md:w-96 h-64 sm:h-64 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="pointer-events-none absolute top-5 sm:top-10 left-5 sm:left-10 w-48 sm:w-48 md:w-96 h-16 sm:h-10 md:h-20 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="pointer-events-none absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-48 sm:w-48 md:w-96 h-16 sm:h-10 md:h-20 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="pointer-events-none absolute top-5 sm:top-10 right-5 sm:right-10 w-48 sm:w-48 md:w-96 h-10 sm:h-6 md:h-10 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="pointer-events-none absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-64 sm:w-64 md:w-96 h-64 sm:h-64 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>

      {/* Header con efecto de gradiente sutil */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-16 pt-6 sm:pt-8 md:pt-12 bg-transparent pb-10 sm:pb-12 md:pb-16">
        {/* Logo o nombre de la app - Larger for mobile */}
        <div className="flex items-center mb-6 sm:mb-6 md:mb-8 px-1">
          <div className="h-12 w-12 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center">
            <img
              className="h-10 w-10 sm:h-8 sm:w-9 md:h-10 md:w-11"
              src={Logo}
              alt="Logo"
            />
          </div>
          <h3
            className="ml-3 font-bold text-lg sm:text-base md:text-lg"
            style={{ color: "#2B3ED1" }}
          >
            NeuroICFES IA
          </h3>
        </div>

        {/* Contenedor principal con máximo ancho para desktop y full width para mobile */}
        <div className="w-full max-w-xl mx-auto">
          {/* Título principal con tipografía más grande para móvil */}
          <h1
            className="text-5xl sm:text-7xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ color: primaryColor }}
          >
            Prepárate para el ICFES con inteligencia artificial
          </h1>

          {/* Subtítulo con buen contraste de color y más grande en móvil */}
          <p className="mt-3 md:mt-3 text-lg sm:text-lg md:text-xl text-gray-600 leading-relaxed">
            Coach virtual IA de alta precisión potencia tu rendimiento en el
            ICFES con análisis y feedback instantáneo 🤖
          </p>

          {/* Icons section - Much larger icons for mobile */}
          <div className="flex justify-center mt-10 sm:mt-8 md:mt-14 mb-10 sm:mb-8 md:mb-12">
            <div className="grid grid-cols-3 gap-3 xs:gap-3 sm:gap-8 md:gap-12 w-full max-w-xl">
              {/* Practice Icon */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-20 h-20 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-3 "
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #b257fd 0%, #7A78FF 100%)",
                  }}
                >
                  <Brain className="h-9 w-9 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="font-medium text-base xs:text-sm sm:text-base ">
                  Practica
                </span>
              </div>

              {/* Question Icon */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-20 h-20 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-3 "
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #b257fd 0%, #7A78FF 100%)",
                  }}
                >
                  <MessageCircle className="h-9 w-9 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="font-medium text-base xs:text-sm sm:text-base ">
                  Pregunta
                </span>
              </div>

              {/* Progress Icon */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-20 h-20 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-3 sm:mb-3 "
                  style={{
                    backgroundImage:
                      "linear-gradient(135deg, #b257fd 0%, #7A78FF 100%)",
                  }}
                >
                  <BarChart2 className="h-9 w-9 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="font-medium text-base xs:text-sm sm:text-base ">
                  Progresa
                </span>
              </div>
            </div>
          </div>

          {/* Botón CTA prominente y accesible - Much larger for mobile */}
          <div className="mx-auto sm:ml-3 mt-6 sm:mt-6 md:mt-15 w-full sm:w-50">
            <button
              onClick={() => navigate("/login")}
              className="w-full max-w-md py-4 sm:py-3 md:py-4 rounded-xl text-[#5956FC] font-medium text-base sm:text-base flex items-center justify-center border"
              style={{
                boxShadow: `0 6px 16px rgba(89, 86, 252, 0.3)`,
              }}
            >
              <span>Comenzar ahora</span>
              <ArrowRight className="h-5 w-5 md:h-5 md:w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

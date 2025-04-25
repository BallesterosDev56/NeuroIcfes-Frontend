import Logo from '../../assets/images/logo.png'
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

  return (
    <div className="w-full min-h-screen relative">
      {/* Círculos decorativos con opacidad - Adjusted positioning for responsiveness */}
      <div className="absolute top-1/4 left-1/4 w-32 sm:w-64 md:w-96 h-32 sm:h-64 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute top-5 sm:top-10 left-5 sm:left-10 w-24 sm:w-48 md:w-96 h-8 sm:h-10 md:h-20 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-5 sm:bottom-10 left-5 sm:left-10 w-24 sm:w-48 md:w-96 h-8 sm:h-10 md:h-20 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute top-5 sm:top-10 right-5 sm:right-10 w-24 sm:w-48 md:w-96 h-4 sm:h-6 md:h-10 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>
      <div className="absolute bottom-5 sm:bottom-10 right-5 sm:right-10 w-32 sm:w-64 md:w-96 h-32 sm:h-64 md:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-5 animate-pulse"></div>

      {/* Header con efecto de gradiente sutil */}
      <div className="w-full px-3 sm:px-6 md:px-8 lg:px-16 pt-4 sm:pt-8 md:pt-12 bg-transparent pb-8 sm:pb-12 md:pb-16">
        {/* Logo o nombre de la app - Improved alignment */}
        <div className="flex items-center mb-4 sm:mb-6 md:mb-8 px-1">
          <div
            className="h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 rounded-xl flex items-center justify-center"
          >
            <img className='h-6 w-7 sm:h-8 sm:w-9 md:h-10 md:w-11' src={Logo} alt="Logo" />
          </div>
          <h3
            className="ml-2 sm:ml-3 font-bold text-sm sm:text-base md:text-lg"
            style={{ color: '#2B3ED1' }}
          >
            NeuroICFES IA
          </h3>
        </div>

        {/* Contenedor principal con máximo ancho para desktop */}
        <div className="max-w-3xl mx-auto">
          {/* Título principal con tipografía optimizada para móvil */}
          <h1
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight"
            style={{ color: primaryColor }}
          >
            Prepárate para el ICFES con inteligencia artificial
          </h1>

          {/* Subtítulo con buen contraste de color */}
          <p className="mt-2 md:mt-3 text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed">
          Coach virtual IA de alta precisión potencia tu rendimiento en el ICFES con análisis y feedback instantáneo 🤖
          </p>

          {/* Icons section - Enhanced visual design for mobile */}
          <div className="flex justify-center mt-6 sm:mt-8 md:mt-14 mb-6 sm:mb-8 md:mb-12">
            <div className="grid grid-cols-3 gap-2 xs:gap-3 sm:gap-8 md:gap-12 w-full max-w-xl">
              {/* Practice Icon */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    backgroundColor: "#5956FC",
                    backgroundImage:
                      "linear-gradient(135deg, #5956FC 0%, #7A78FF 100%)",
                  }}
                >
                  <Brain className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="font-medium text-xs xs:text-sm sm:text-base group-hover:text-indigo-700 transition-colors duration-300">
                  Practica
                </span>
              </div>

              {/* Question Icon */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    backgroundColor: "#5956FC",
                    backgroundImage:
                      "linear-gradient(135deg, #5956FC 0%, #7A78FF 100%)",
                  }}
                >
                  <MessageCircle className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="font-medium text-xs xs:text-sm sm:text-base group-hover:text-indigo-700 transition-colors duration-300">
                  Pregunta
                </span>
              </div>

              {/* Progress Icon */}
              <div className="flex flex-col items-center group cursor-pointer">
                <div
                  className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2 sm:mb-3 transform transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{
                    backgroundColor: "#5956FC",
                    backgroundImage:
                      "linear-gradient(135deg, #5956FC 0%, #7A78FF 100%)",
                  }}
                >
                  <BarChart2 className="h-5 w-5 xs:h-6 xs:w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <span className="font-medium text-xs xs:text-sm sm:text-base group-hover:text-indigo-700 transition-colors duration-300">
                  Progresa
                </span>
              </div>
            </div>
          </div>

          {/* Botón CTA prominente y accesible - Fixed mobile alignment and sizing */}
          <div className="mx-auto sm:ml-3 mt-4 sm:mt-6 md:mt-15 w-full sm:w-50">
            <button
              className="w-full max-w-md py-2.5 sm:py-3 md:py-4 rounded-lg sm:rounded-xl text-[#5956FC] font-medium text-sm sm:text-base flex items-center justify-center border"
              style={{
                boxShadow: `0 4px 12px rgba(89, 86, 252, 0.25)`,
              }}
            >
              <span>Comenzar ahora</span>
              <ArrowRight className="h-4 w-4 md:h-5 md:w-5 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
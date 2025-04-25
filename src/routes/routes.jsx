import { createBrowserRouter } from "react-router-dom";
import { SplashScreen } from "../Pages/SplashScreen/SplashScreen.jsx";
import { Introduction } from "../Pages/Introduccion/Introduction.jsx";

import { Login } from "../Pages/Login/Login.jsx";
import { Register } from "../Pages/Register/Register";
import { Home } from "../Pages/Home/Home.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute";

export const routes = createBrowserRouter([
  // 🔓 Rutas públicas (No requieren autenticación)
  {
    path: '/',
    element: <SplashScreen/>
  },
  {
    path: '/introduction',
    element: <Introduction/>
  },
  {
    path: '/login',
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  },
  // 🔒 Rutas protegidas (Requieren autenticación)
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <Home/>
      </ProtectedRoute>
    )
  }
])
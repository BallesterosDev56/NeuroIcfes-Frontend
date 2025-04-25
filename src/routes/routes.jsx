import { createBrowserRouter } from "react-router-dom";
import { SplashScreen } from "../Pages/SplashScreen/SplashScreen.jsx";
import { Introduction } from "../Pages/Introduccion/Introduction.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { UserInfoRoute } from "../components/UserInfoRoute";
import { ProfileGuard } from "../components/ProfileGuard";

import { Login } from "../Pages/Login/Login.jsx";
import { Register } from "../Pages/Register/Register";
import { ResetPassword } from "../Pages/ResetPassword/ResetPassword";
import { UserInfo } from "../Pages/UserInfo/UserInfo.jsx";
import { Home } from "../Pages/Home/Home.jsx";

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
  {
    path: '/reset-password',
    element: <ResetPassword/>
  },
  // 🔒 Rutas protegidas (Requieren autenticación)
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <ProfileGuard>
          <Home/>
        </ProfileGuard>
      </ProtectedRoute>
    )
  },
  {
    path: '/user-info',
    element: (
      <ProtectedRoute>
        <UserInfoRoute>
          <UserInfo/>
        </UserInfoRoute>
      </ProtectedRoute>
    )
  }
])
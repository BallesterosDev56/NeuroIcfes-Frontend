import { createBrowserRouter } from "react-router-dom";
import { SplashScreen } from "../Pages/SplashScreen/SplashScreen.jsx";
import { Introduction } from "../Pages/Introduccion/Introduction.jsx";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { UserInfoRoute } from "../components/UserInfoRoute";
import { ProfileGuard } from "../components/ProfileGuard";
import { AdminDashboard } from "../Pages/Admin/AdminDashboard";
import { ErrorBoundary } from "../components/ErrorBoundary";

import { Login } from "../Pages/Login/Login.jsx";
import { Register } from "../Pages/Register/Register";
import { ResetPassword } from "../Pages/ResetPassword/ResetPassword";
import { UserInfo } from "../Pages/UserInfo/UserInfo.jsx";
import { Home } from "../Pages/Home/Home.jsx";

export const routes = createBrowserRouter([
  // 🔓 Rutas públicas (No requieren autenticación)
  {
    path: '/',
    element: <SplashScreen/>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/introduction',
    element: <Introduction/>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/login',
    element: <Login/>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/register',
    element: <Register/>,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/reset-password',
    element: <ResetPassword/>,
    errorElement: <ErrorBoundary />
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
    ),
    errorElement: <ErrorBoundary />
  },
  {
    path: '/user-info',
    element: (
      <ProtectedRoute>
        <UserInfoRoute>
          <UserInfo/>
        </UserInfoRoute>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute requireAdmin={true}>
        <AdminDashboard/>
      </ProtectedRoute>
    ),
    errorElement: <ErrorBoundary />
  },
  // Ruta para manejar cualquier otra ruta no definida
  {
    path: '*',
    element: <ErrorBoundary />,
    errorElement: <ErrorBoundary />
  }
]);
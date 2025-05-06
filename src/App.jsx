import './App.css'
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/routes";
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <RouterProvider router={routes}/>
      </AppProvider>
    </AuthProvider>
  )
}

export default App

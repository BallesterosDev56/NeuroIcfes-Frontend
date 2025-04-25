import './App.css'
import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/routes";
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={routes}/>
    </AuthProvider>
  )
}

export default App

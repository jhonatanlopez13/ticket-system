import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Casos from './pages/Casos';
import CasoDetail from './pages/CasoDetail';
import NuevoCaso from './pages/NuevoCaso';
import Usuarios from './pages/Usuarios';
import Reportes from './pages/Reportes';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/casos"
        element={
          <ProtectedRoute>
            <Casos />
          </ProtectedRoute>
        }
      />
      <Route
        path="/casos/nuevo"
        element={
          <ProtectedRoute>
            <NuevoCaso />
          </ProtectedRoute>
        }
      />
      <Route
        path="/casos/:id"
        element={
          <ProtectedRoute>
            <CasoDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute rolesPermitidos={['superadmin', 'admin']}>
            <Usuarios />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reportes"
        element={
          <ProtectedRoute rolesPermitidos={['superadmin', 'admin']}>
            <Reportes />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

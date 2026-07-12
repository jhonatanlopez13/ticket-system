import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, rolesPermitidos }) {
  const { autenticado, cargando, rol } = useAuth();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Cargando...
      </div>
    );
  }

  if (!autenticado) return <Navigate to="/login" replace />;

  if (rolesPermitidos && !rolesPermitidos.includes(rol)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

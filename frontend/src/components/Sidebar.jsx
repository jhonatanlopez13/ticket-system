import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Users, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white' : 'text-slate-600 hover:bg-slate-100'
  }`;

export default function Sidebar() {
  const { rol, perfil, logout } = useAuth();
  const esStaff = rol === 'admin' || rol === 'superadmin';

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-slate-100">
        <h1 className="text-lg font-bold text-brand-700">Sistema de Casos</h1>
        <p className="text-xs text-slate-400 mt-0.5">{perfil?.nombre}</p>
        <span className="inline-block mt-1 text-[11px] uppercase tracking-wide font-semibold text-brand-500">
          {rol}
        </span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        <NavLink to="/" end className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/casos" className={linkClass}>
          <Ticket size={18} /> Casos
        </NavLink>
        <NavLink to="/casos/nuevo" className={linkClass}>
          <PlusCircle size={18} /> Registrar caso
        </NavLink>
        {esStaff && (
          <NavLink to="/usuarios" className={linkClass}>
            <Users size={18} /> Usuarios
          </NavLink>
        )}
        {esStaff && (
          <NavLink to="/reportes" className={linkClass}>
            <BarChart3 size={18} /> Reportes
          </NavLink>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition"
        >
          <LogOut size={18} /> Cerrar sesión
        </button>
      </div>
    </aside>
  );
}

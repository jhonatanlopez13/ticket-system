import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useAuth } from '../context/AuthContext';
import { listarCasos } from '../services/ticketService';

const TARJETAS = [
  { key: 'abierto', label: 'Abiertos', color: 'bg-blue-50 text-blue-700' },
  { key: 'en_proceso', label: 'En proceso', color: 'bg-amber-50 text-amber-700' },
  { key: 'resuelto', label: 'Resueltos', color: 'bg-emerald-50 text-emerald-700' },
  { key: 'cerrado', label: 'Cerrados', color: 'bg-slate-100 text-slate-700' },
];

export default function Dashboard() {
  const { perfil, rol } = useAuth();
  const [casos, setCasos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    listarCasos()
      .then(setCasos)
      .finally(() => setCargando(false));
  }, []);

  const conteo = (estado) => casos.filter((c) => c.estado === estado).length;

  const tituloRol = {
    superadmin: 'Panel de Super Administrador',
    admin: 'Panel de Administrador',
    agente: 'Mis casos asignados',
    solicitante: 'Mis casos registrados',
  }[rol];

  return (
    <Layout titulo="Dashboard">
      <p className="text-slate-500 mb-6">
        Hola, <span className="font-medium text-slate-700">{perfil?.nombre}</span> — {tituloRol}
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {TARJETAS.map((t) => (
          <div key={t.key} className={`rounded-xl p-5 ${t.color}`}>
            <p className="text-3xl font-bold">{conteo(t.key)}</p>
            <p className="text-sm font-medium mt-1">{t.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-semibold text-slate-700">Casos recientes</h3>
          <Link to="/casos" className="text-sm text-brand-600 hover:underline">
            Ver todos
          </Link>
        </div>
        {cargando ? (
          <p className="p-6 text-sm text-slate-400">Cargando...</p>
        ) : casos.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No hay casos todavía.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {casos.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/casos/${c.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition"
              >
                <div>
                  <p className="text-sm font-medium text-slate-700">{c.titulo}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Creado por {c.creadoPorNombre} · {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge prioridad={c.prioridad} />
                  <StatusBadge estado={c.estado} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

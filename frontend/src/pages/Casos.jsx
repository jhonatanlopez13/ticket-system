import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { listarCasos, ESTADOS, PRIORIDADES } from '../services/ticketService';

export default function Casos() {
  const [casos, setCasos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroPrioridad, setFiltroPrioridad] = useState('');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    cargar();
  }, [filtroEstado, filtroPrioridad]);

  function cargar() {
    setCargando(true);
    listarCasos({ estado: filtroEstado || undefined, prioridad: filtroPrioridad || undefined })
      .then(setCasos)
      .finally(() => setCargando(false));
  }

  const casosFiltrados = casos.filter((c) => c.titulo.toLowerCase().includes(busqueda.toLowerCase()));

  return (
    <Layout titulo="Casos">
      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por título..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={filtroEstado}
          onChange={(e) => setFiltroEstado(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <select
          value={filtroPrioridad}
          onChange={(e) => setFiltroPrioridad(e.target.value)}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todas las prioridades</option>
          {PRIORIDADES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {cargando ? (
          <p className="p-6 text-sm text-slate-400">Cargando casos...</p>
        ) : casosFiltrados.length === 0 ? (
          <p className="p-6 text-sm text-slate-400">No se encontraron casos.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Título</th>
                <th className="px-5 py-3 font-medium">Asignado a</th>
                <th className="px-5 py-3 font-medium">Prioridad</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {casosFiltrados.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <Link to={`/casos/${c.id}`} className="text-brand-600 font-medium hover:underline">
                      {c.titulo}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{c.asignadoANombre || '— Sin asignar —'}</td>
                  <td className="px-5 py-3">
                    <PriorityBadge prioridad={c.prioridad} />
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge estado={c.estado} />
                  </td>
                  <td className="px-5 py-3 text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

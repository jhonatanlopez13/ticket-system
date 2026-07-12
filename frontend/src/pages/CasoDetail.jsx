import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import { useAuth } from '../context/AuthContext';
import {
  obtenerCaso,
  asignarCaso,
  cambiarEstado,
  listarComentarios,
  agregarComentario,
  ESTADOS,
} from '../services/ticketService';
import { listarUsuarios } from '../services/userService';

export default function CasoDetail() {
  const { id } = useParams();
  const { rol, perfil } = useAuth();
  const [caso, setCaso] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [agentes, setAgentes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [agenteSeleccionado, setAgenteSeleccionado] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');

  const esStaff = rol === 'admin' || rol === 'superadmin';
  const esAsignado = caso?.asignadoA === perfil?.uid;

  useEffect(() => {
    cargarTodo();
  }, [id]);

  async function cargarTodo() {
    setCargando(true);
    try {
      const [c, coms] = await Promise.all([obtenerCaso(id), listarComentarios(id)]);
      setCaso(c);
      setComentarios(coms);
      if (esStaff) {
        const lista = await listarUsuarios('agente');
        setAgentes(lista);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  }

  async function handleAsignar(e) {
    e.preventDefault();
    if (!agenteSeleccionado) return;
    try {
      const actualizado = await asignarCaso(id, agenteSeleccionado);
      setCaso(actualizado);
      setMensaje('Caso asignado correctamente.');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCambiarEstado(estado) {
    try {
      const actualizado = await cambiarEstado(id, estado);
      setCaso(actualizado);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleComentar(e) {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    try {
      const c = await agregarComentario(id, nuevoComentario);
      setComentarios((prev) => [...prev, c]);
      setNuevoComentario('');
    } catch (err) {
      setError(err.message);
    }
  }

  if (cargando) {
    return (
      <Layout titulo="Detalle del caso">
        <p className="text-slate-400 text-sm">Cargando...</p>
      </Layout>
    );
  }

  if (!caso) {
    return (
      <Layout titulo="Detalle del caso">
        <p className="text-red-500 text-sm">{error || 'Caso no encontrado.'}</p>
      </Layout>
    );
  }

  const puedeCambiarEstado = esStaff || esAsignado;

  return (
    <Layout titulo={`Caso: ${caso.titulo}`}>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <PriorityBadge prioridad={caso.prioridad} />
              <StatusBadge estado={caso.estado} />
              <span className="text-xs text-slate-400">· {caso.categoria}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">{caso.titulo}</h2>
            <p className="text-slate-600 text-sm whitespace-pre-wrap">{caso.descripcion}</p>
            <div className="text-xs text-slate-400 mt-4 flex gap-4">
              <span>Creado por {caso.creadoPorNombre}</span>
              <span>{new Date(caso.createdAt).toLocaleString()}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-700 mb-4">Comentarios</h3>
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
              {comentarios.length === 0 && <p className="text-sm text-slate-400">Aún no hay comentarios.</p>}
              {comentarios.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold shrink-0">
                    {c.autorNombre?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-medium text-slate-700">{c.autorNombre}</span>{' '}
                      <span className="text-xs text-slate-400">
                        · {new Date(c.createdAt).toLocaleString()}
                      </span>
                    </p>
                    <p className="text-sm text-slate-600">{c.texto}</p>
                  </div>
                </div>
              ))}
            </div>
            <form onSubmit={handleComentar} className="flex gap-2">
              <input
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                placeholder="Escribe un comentario..."
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
              <button
                type="submit"
                className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 rounded-lg"
              >
                Enviar
              </button>
            </form>
          </div>
        </div>

        <div className="space-y-6">
          {esStaff && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Asignar agente</h3>
              <form onSubmit={handleAsignar} className="space-y-3">
                <select
                  value={agenteSeleccionado}
                  onChange={(e) => setAgenteSeleccionado(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">
                    {caso.asignadoANombre ? `Actual: ${caso.asignadoANombre}` : 'Selecciona un agente'}
                  </option>
                  {agentes.map((a) => (
                    <option key={a.uid} value={a.uid}>
                      {a.nombre}
                    </option>
                  ))}
                </select>
                <button
                  type="submit"
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2 rounded-lg"
                >
                  Asignar
                </button>
              </form>
              {mensaje && <p className="text-xs text-emerald-600 mt-2">{mensaje}</p>}
            </div>
          )}

          {puedeCambiarEstado && (
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <h3 className="font-semibold text-slate-700 mb-3 text-sm">Cambiar estado</h3>
              <div className="flex flex-col gap-2">
                {ESTADOS.map((e) => (
                  <button
                    key={e}
                    onClick={() => handleCambiarEstado(e)}
                    disabled={caso.estado === e}
                    className={`text-sm text-left px-3 py-2 rounded-lg border transition ${
                      caso.estado === e
                        ? 'bg-brand-50 border-brand-200 text-brand-700 cursor-default'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <h3 className="font-semibold text-slate-700 mb-3 text-sm">Historial</h3>
            <ul className="space-y-3">
              {[...caso.historial].reverse().map((h, i) => (
                <li key={i} className="text-xs">
                  <p className="text-slate-600">
                    <span className="font-medium">{h.usuarioNombre}</span> — {h.detalle}
                  </p>
                  <p className="text-slate-400">{new Date(h.fecha).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 mt-4">{error}</p>}
    </Layout>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { crearCaso, PRIORIDADES } from '../services/ticketService';

export default function NuevoCaso() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ titulo: '', descripcion: '', categoria: 'general', prioridad: 'media' });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');

  function actualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      const caso = await crearCaso(form);
      navigate(`/casos/${caso.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <Layout titulo="Registrar caso">
      <div className="max-w-2xl bg-white rounded-xl border border-slate-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Título</label>
            <input
              required
              value={form.titulo}
              onChange={(e) => actualizar('titulo', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Resumen breve del caso"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Descripción</label>
            <textarea
              required
              rows={5}
              value={form.descripcion}
              onChange={(e) => actualizar('descripcion', e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="Describe el caso con el mayor detalle posible..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Categoría</label>
              <input
                value={form.categoria}
                onChange={(e) => actualizar('categoria', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="ej. soporte técnico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Prioridad</label>
              <select
                value={form.prioridad}
                onChange={(e) => actualizar('prioridad', e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              >
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="bg-brand-600 hover:bg-brand-700 text-white font-medium px-5 py-2.5 rounded-lg transition disabled:opacity-60"
          >
            {enviando ? 'Registrando...' : 'Registrar caso'}
          </button>
        </form>
      </div>
    </Layout>
  );
}

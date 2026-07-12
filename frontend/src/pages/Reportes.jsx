import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import Layout from '../components/Layout';
import { reporteGeneral, reporteCargaAgentes } from '../services/reportService';

function objetoAArreglo(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}

export default function Reportes() {
  const [general, setGeneral] = useState(null);
  const [carga, setCarga] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([reporteGeneral(), reporteCargaAgentes()])
      .then(([g, c]) => {
        setGeneral(g);
        setCarga(c);
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) {
    return (
      <Layout titulo="Reportes">
        <p className="text-sm text-slate-400">Cargando reportes...</p>
      </Layout>
    );
  }

  return (
    <Layout titulo="Reportes">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-slate-800">{general.totalCasos}</p>
          <p className="text-sm text-slate-400 mt-1">Total de casos</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-slate-800">
            {general.tiempoPromedioResolucionHoras ?? '—'}
          </p>
          <p className="text-sm text-slate-400 mt-1">Horas promedio de resolución</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-slate-800">{general.porEstado?.abierto || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Casos abiertos</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <p className="text-3xl font-bold text-slate-800">{general.porEstado?.resuelto || 0}</p>
          <p className="text-sm text-slate-400 mt-1">Casos resueltos</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Casos por estado</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={objetoAArreglo(general.porEstado)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b5fe0" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Casos por prioridad</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={objetoAArreglo(general.porPrioridad)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Casos por categoría</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={objetoAArreglo(general.porCategoria)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm">Carga activa por agente</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={carga.map((c) => ({ name: c.agenteNombre, value: c.casosActivos }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Layout>
  );
}

import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from '../services/userService';

const ROLES_DISPONIBLES = {
  superadmin: ['superadmin', 'admin', 'agente', 'solicitante'],
  admin: ['agente', 'solicitante'],
};

export default function Usuarios() {
  const { rol } = useAuth();
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [mostrarForm, setMostrarForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rol: 'solicitante', telefono: '' });
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  const rolesCreables = ROLES_DISPONIBLES[rol] || [];

  useEffect(() => {
    cargar();
  }, []);

  function cargar() {
    setCargando(true);
    listarUsuarios()
      .then(setUsuarios)
      .finally(() => setCargando(false));
  }

  async function handleCrear(e) {
    e.preventDefault();
    setError('');
    setEnviando(true);
    try {
      await crearUsuario(form);
      setForm({ nombre: '', email: '', password: '', rol: 'solicitante', telefono: '' });
      setMostrarForm(false);
      cargar();
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function toggleActivo(u) {
    await actualizarUsuario(u.uid, { activo: !u.activo });
    cargar();
  }

  async function handleEliminar(u) {
    if (!confirm(`¿Eliminar a ${u.nombre}? Esta acción no se puede deshacer.`)) return;
    await eliminarUsuario(u.uid);
    cargar();
  }

  return (
    <Layout titulo="Usuarios">
      <div className="flex justify-between items-center mb-5">
        <p className="text-slate-500 text-sm">Gestiona las cuentas del sistema según tu nivel de acceso.</p>
        <button
          onClick={() => setMostrarForm((v) => !v)}
          className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          {mostrarForm ? 'Cancelar' : '+ Nuevo usuario'}
        </button>
      </div>

      {mostrarForm && (
        <form onSubmit={handleCrear} className="bg-white rounded-xl border border-slate-200 p-5 mb-6 grid grid-cols-2 gap-4">
          <input
            required
            placeholder="Nombre completo"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            type="email"
            placeholder="Correo electrónico"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            required
            type="password"
            placeholder="Contraseña temporal"
            value={form.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <select
            value={form.rol}
            onChange={(e) => setForm((f) => ({ ...f, rol: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
          >
            {rolesCreables.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <input
            placeholder="Teléfono (opcional)"
            value={form.telefono}
            onChange={(e) => setForm((f) => ({ ...f, telefono: e.target.value }))}
            className="border border-slate-300 rounded-lg px-3 py-2 text-sm col-span-2"
          />
          {error && <p className="text-sm text-red-500 col-span-2">{error}</p>}
          <button
            type="submit"
            disabled={enviando}
            className="col-span-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium py-2.5 rounded-lg disabled:opacity-60"
          >
            {enviando ? 'Creando...' : 'Crear usuario'}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {cargando ? (
          <p className="p-6 text-sm text-slate-400">Cargando...</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left">
              <tr>
                <th className="px-5 py-3 font-medium">Nombre</th>
                <th className="px-5 py-3 font-medium">Correo</th>
                <th className="px-5 py-3 font-medium">Rol</th>
                <th className="px-5 py-3 font-medium">Estado</th>
                <th className="px-5 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usuarios.map((u) => (
                <tr key={u.uid} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-700">{u.nombre}</td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3 text-slate-500 uppercase text-xs font-semibold">{u.rol}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right space-x-3">
                    <button onClick={() => toggleActivo(u)} className="text-xs text-brand-600 hover:underline">
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                    <button onClick={() => handleEliminar(u)} className="text-xs text-red-500 hover:underline">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

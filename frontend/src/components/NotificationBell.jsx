import { useEffect, useState, useRef } from 'react';
import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { escucharNotificaciones, marcarLeida, marcarTodasLeidas } from '../services/notificationService';

export default function NotificationBell() {
  const { firebaseUser } = useAuth();
  const [notis, setNotis] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const ref = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!firebaseUser) return;
    const unsub = escucharNotificaciones(firebaseUser.uid, setNotis);
    return unsub;
  }, [firebaseUser]);

  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setAbierto(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const noLeidas = notis.filter((n) => !n.leido).length;

  async function abrirNotificacion(n) {
    if (!n.leido) await marcarLeida(n.id).catch(() => {});
    setAbierto(false);
    if (n.casoId) navigate(`/casos/${n.casoId}`);
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setAbierto((v) => !v)}
        className="relative p-2 rounded-full hover:bg-slate-100 transition"
      >
        <Bell size={20} className="text-slate-600" />
        {noLeidas > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-slate-200 z-50 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="font-semibold text-slate-700 text-sm">Notificaciones</span>
            {noLeidas > 0 && (
              <button
                onClick={() => marcarTodasLeidas().catch(() => {})}
                className="text-xs text-brand-600 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>
          {notis.length === 0 ? (
            <p className="text-sm text-slate-400 px-4 py-6 text-center">No tienes notificaciones.</p>
          ) : (
            notis.map((n) => (
              <button
                key={n.id}
                onClick={() => abrirNotificacion(n)}
                className={`w-full text-left px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition ${
                  !n.leido ? 'bg-brand-50/50' : ''
                }`}
              >
                <p className="text-sm text-slate-700">{n.mensaje}</p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

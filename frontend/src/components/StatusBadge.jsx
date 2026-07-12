const ESTILOS = {
  abierto: 'bg-blue-100 text-blue-700',
  en_proceso: 'bg-amber-100 text-amber-700',
  resuelto: 'bg-emerald-100 text-emerald-700',
  cerrado: 'bg-slate-200 text-slate-600',
};

const ETIQUETAS = {
  abierto: 'Abierto',
  en_proceso: 'En proceso',
  resuelto: 'Resuelto',
  cerrado: 'Cerrado',
};

export default function StatusBadge({ estado }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTILOS[estado] || 'bg-slate-100 text-slate-600'}`}>
      {ETIQUETAS[estado] || estado}
    </span>
  );
}

const ESTILOS = {
  baja: 'bg-slate-100 text-slate-600',
  media: 'bg-sky-100 text-sky-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

const ETIQUETAS = { baja: 'Baja', media: 'Media', alta: 'Alta', urgente: 'Urgente' };

export default function PriorityBadge({ prioridad }) {
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ESTILOS[prioridad] || 'bg-slate-100 text-slate-600'}`}>
      {ETIQUETAS[prioridad] || prioridad}
    </span>
  );
}

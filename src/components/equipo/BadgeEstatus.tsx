import type { EstatusEvento } from '@/app/(equipo)/equipo/listado-eventos/types';

const estilos: Record<EstatusEvento, string> = {
  Activo: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  'En curso': 'bg-blue-50 text-blue-700 ring-blue-600/20',
  Cancelado: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  Finalizado: 'bg-slate-100 text-slate-600 ring-slate-500/20',
};

export default function BadgeEstatus({ estatus }: { estatus: EstatusEvento }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${estilos[estatus]}`}
    >
      {estatus}
    </span>
  );
}

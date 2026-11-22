import { STAFF_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';

export default async function ListadoEventosPage() {
  const user = await requireRole(STAFF_ROLES, '/login/equipo');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Panel de organización
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Organizar eventos</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Sesión de {user.nombre || user.email}. Aquí se administrarán los eventos,
        cupos e inscripciones.
      </p>
    </div>
  );
}

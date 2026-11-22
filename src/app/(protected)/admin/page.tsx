import { requireRole } from '@/lib/dal';

export default async function AdminPage() {
  const user = await requireRole(['admin'], '/login/equipo');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Panel de administración
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Administración</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Sesión de {user.nombre || user.email}. Aquí se administrarán los roles y
        la configuración general del sistema.
      </p>
    </div>
  );
}

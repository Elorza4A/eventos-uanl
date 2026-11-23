import { requireRole } from '@/lib/dal';

export default async function UsuariosPage() {
  const user = await requireRole(['admin'], '/equipo/login');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Panel de administración
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Usuarios</h1>
      <p className="mt-3 text-sm leading-relaxed text-gray-600">
        Sesión de {user.nombre || user.email}. Selecciona una sección para
        administrar las cuentas del equipo.
      </p>
    </div>
  );
}

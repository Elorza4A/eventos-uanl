import Link from 'next/link';

import { ROLE_LABELS, STAFF_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';

const cardClassName =
  'block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-primary)] hover:shadow-md';

export default async function InicioEquipoPage() {
  const user = await requireRole(STAFF_ROLES, '/login/equipo');

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Inicio · Equipo
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">
          Hola, {user.nombre || user.email}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Sesión de {ROLE_LABELS[user.rol]}. Desde aquí puedes gestionar los
          eventos de la universidad.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link href="/listado-eventos" className={cardClassName}>
          <span className="text-base font-semibold text-gray-900">
            Listado de eventos
          </span>
          <span className="mt-2 block text-sm text-gray-600">
            Administra los eventos, cupos e inscripciones.
          </span>
        </Link>

        {user.rol === 'admin' ? (
          <Link href="/admin" className={cardClassName}>
            <span className="text-base font-semibold text-gray-900">
              Administración
            </span>
            <span className="mt-2 block text-sm text-gray-600">
              Gestiona roles y la configuración general del sistema.
            </span>
          </Link>
        ) : null}
      </section>
    </div>
  );
}

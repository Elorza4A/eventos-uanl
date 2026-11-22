import Link from 'next/link';
import { redirect } from 'next/navigation';

import { STAFF_ROLES } from '@/config/permissions';
import { getPerfil } from '@/lib/auth/perfil';
import { requireRole } from '@/lib/dal';

import EventosTable from './EventosTable';
import { obtenerEventos } from './data';

export default async function ListadoEventosPage() {
  await requireRole(STAFF_ROLES, '/equipo/login');

  const perfil = await getPerfil();
  if (!perfil.equipo) redirect('/no-autorizado');

  const esAdministrador = perfil.equipo.rol === 'Administrador';
  const eventos = await obtenerEventos({
    esAdministrador,
    idDependencia: perfil.equipo.idDependencia,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
            Equipo · Eventos
          </p>
          <h1 className="mt-1 text-2xl font-bold text-gray-900">Eventos</h1>
        </div>

        {esAdministrador ? null : (
          <Link
            href="/equipo/listado-eventos/nuevo"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]"
          >
            Nuevo evento
          </Link>
        )}
      </header>

      <EventosTable eventos={eventos} rol={perfil.equipo.rol} />
    </div>
  );
}

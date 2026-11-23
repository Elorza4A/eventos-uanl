import Link from 'next/link';
import { notFound } from 'next/navigation';

import { STAFF_ROLES } from '@/config/permissions';
import { getPerfil } from '@/lib/auth/perfil';
import { requireRole } from '@/lib/dal';

import { obtenerEventoPorId } from '../data';
import EventTabs from './EventTabs';

type Props = {
  children: React.ReactNode;
  params: Promise<{ idEvento: string }>;
};

export default async function EventoLayout({ children, params }: Props) {
  await requireRole(STAFF_ROLES, '/equipo/login');

  const { idEvento: parametro } = await params;
  if (!/^\d+$/.test(parametro)) notFound();

  const idEvento = Number(parametro);
  if (!Number.isSafeInteger(idEvento) || idEvento <= 0) notFound();

  const perfil = await getPerfil();
  if (!perfil.equipo) notFound();

  const evento = await obtenerEventoPorId(idEvento, {
    esAdministrador: perfil.equipo.rol === 'Administrador',
    idDependencia: perfil.equipo.idDependencia,
  });
  if (!evento) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/equipo/listado-eventos"
        className="inline-flex text-sm font-medium text-[var(--color-primary)] hover:underline"
      >
        ← Volver al listado
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Detalle del evento
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          {evento.nombreEvento}
        </h1>
      </div>

      <EventTabs idEvento={parametro} />
      {children}
    </div>
  );
}

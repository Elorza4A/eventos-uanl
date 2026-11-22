import { redirect } from 'next/navigation';

import { STAFF_ROLES } from '@/config/permissions';
import { getPerfil } from '@/lib/auth/perfil';
import { requireRole } from '@/lib/dal';

export default async function NuevoEventoPage() {
  await requireRole(STAFF_ROLES, '/equipo/login');

  const perfil = await getPerfil();
  if (perfil.equipo?.rol !== 'Organizador') redirect('/no-autorizado');

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Organizador · Eventos
      </p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">Nuevo evento</h1>
      <p className="mt-3 text-sm text-gray-600">Próximamente.</p>
    </div>
  );
}

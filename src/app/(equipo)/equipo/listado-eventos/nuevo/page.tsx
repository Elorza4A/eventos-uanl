import { redirect } from 'next/navigation';

import { STAFF_ROLES } from '@/config/permissions';
import { obtenerDependencias } from '@/app/(equipo)/equipo/listado-eventos/data';
import { getPerfil } from '@/lib/auth/perfil';
import { requireRole } from '@/lib/dal';

import NuevoEventoForm from './NuevoEventoForm';

export default async function NuevoEventoPage() {
  await requireRole(STAFF_ROLES, '/equipo/login');

  const perfil = await getPerfil();
  if (
    !perfil.user ||
    perfil.equipo?.rol !== 'Organizador' ||
    perfil.equipo.idDependencia === null
  ) {
    redirect('/no-autorizado');
  }

  const dependencias = await obtenerDependencias();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Organizador · Eventos
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">Nuevo evento</h1>
        <p className="mt-2 text-sm text-slate-600">
          Completa la información del evento. La dependencia y el organizador se
          asignan automáticamente desde tu cuenta.
        </p>
      </header>

      <NuevoEventoForm
        dependencias={dependencias}
        idDependencia={perfil.equipo.idDependencia}
        nombreOrganizador={perfil.equipo.nombre ?? perfil.user.email}
      />
    </div>
  );
}

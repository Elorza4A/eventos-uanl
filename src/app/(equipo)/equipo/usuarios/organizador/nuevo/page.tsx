import { obtenerDependencias } from '@/app/(equipo)/equipo/listado-eventos/data';

import FormularioNuevoUsuario from '../../FormularioNuevoUsuario';

export default async function NuevoOrganizadorPage() {
  const dependencias = await obtenerDependencias();

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Usuarios · Organizador
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Nuevo organizador
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Registra una cuenta con rol Organizador, asigna su dependencia y envía
          la invitación.
        </p>
      </header>

      <FormularioNuevoUsuario
        rol="Organizador"
        dependencias={dependencias}
      />
    </div>
  );
}

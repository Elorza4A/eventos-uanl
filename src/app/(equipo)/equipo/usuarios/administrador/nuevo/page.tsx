import FormularioNuevoUsuario from '../../FormularioNuevoUsuario';

export default function NuevoAdministradorPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Usuarios · Administrador
        </p>
        <h1 className="mt-1 text-2xl font-bold text-gray-900">
          Nuevo administrador
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Registra una cuenta con rol Administrador y envía la invitación.
        </p>
      </header>

      <FormularioNuevoUsuario rol="Administrador" dependencias={[]} />
    </div>
  );
}

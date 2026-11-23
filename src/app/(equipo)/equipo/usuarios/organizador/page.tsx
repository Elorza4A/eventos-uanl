import Toast from '@/components/ui/Toast';
import { esquemaCorreo } from '@/lib/validations/usuario-equipo';
import Link from 'next/link';

import { getUsuariosEquipo } from '../data';
import UsuariosTable from '../UsuariosTable';

type Props = {
  searchParams: Promise<{ invitacion?: string | string[] }>;
};

export default async function UsuariosOrganizadorPage({ searchParams }: Props) {
  const [usuarios, { invitacion }] = await Promise.all([
    getUsuariosEquipo('Organizador'),
    searchParams,
  ]);

  const correo =
    typeof invitacion === 'string' ? esquemaCorreo.safeParse(invitacion) : null;
  const aviso =
    correo?.success ? `Invitación enviada a ${correo.data}` : null;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Organizadores</h2>
          <p className="mt-1 text-sm text-slate-600">
            Cuentas con rol Organizador y su dependencia asignada.
          </p>
        </div>
        <Link
          href="/equipo/usuarios/organizador/nuevo"
          className="inline-flex w-fit items-center justify-center rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Nuevo usuario
        </Link>
      </div>

      <UsuariosTable
        usuarios={usuarios}
        mostrarDependencia
        mensajeVacio="No hay organizadores registrados todavía"
      />

      <Toast key={aviso ?? 'sin-aviso'} mensaje={aviso} />
    </section>
  );
}

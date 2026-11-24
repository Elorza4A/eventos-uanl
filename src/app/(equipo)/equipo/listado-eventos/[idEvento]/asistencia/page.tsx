import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';

import { STAFF_ROLES } from '@/config/permissions';
import { getPerfil } from '@/lib/auth/perfil';
import { requireRole } from '@/lib/dal';
import { createClient } from '@/utils/supabase/server';

import { obtenerDetalleEvento } from '../../data';
import CapturaAsistencia from './CapturaAsistencia';
import ResumenAsistencia from './ResumenAsistencia';
import TablaAsistencia from './TablaAsistencia';
import {
  estatusPermiteRegistroAsistencia,
  listaAsistenciaSchema,
  MENSAJE_ESTATUS_NO_PERMITIDO,
  resumenAsistenciaSchema,
  type AsistenciaFila,
} from './schemas';

type Props = {
  params: Promise<{ idEvento: string }>;
};

export default async function AsistenciaPage({ params }: Props) {
  await requireRole(STAFF_ROLES, '/equipo/login');

  const { idEvento: parametro } = await params;
  if (!/^\d+$/.test(parametro)) notFound();

  const idEvento = Number(parametro);
  if (!Number.isSafeInteger(idEvento) || idEvento <= 0) notFound();

  const perfil = await getPerfil();
  if (!perfil.user || !perfil.equipo) notFound();

  const esAdministrador = perfil.equipo.rol === 'Administrador';
  const evento = await obtenerDetalleEvento(idEvento, {
    esAdministrador,
    idDependencia: perfil.equipo.idDependencia,
  });
  if (!evento) notFound();

  const puedeRegistrar =
    perfil.equipo.rol === 'Organizador' &&
    perfil.equipo.idDependencia !== null &&
    evento.idDependencia !== null &&
    perfil.equipo.idDependencia === evento.idDependencia &&
    estatusPermiteRegistroAsistencia(evento.estatus);

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.rpc('listar_asistencia_evento_uanl', {
    p_evento: idEvento,
  });

  if (error) {
    console.error('[asistencia] No se pudo cargar la lista:', error.message);
  }

  const validados = listaAsistenciaSchema.safeParse(data ?? []);
  if (!validados.success) {
    console.error(
      '[asistencia] Respuesta inesperada de la RPC de listado:',
      validados.error.issues,
    );
  }
  const asistencias: AsistenciaFila[] = validados.success ? validados.data : [];

  const { data: datosResumen, error: errorResumen } = await supabase.rpc(
    'resumen_asistencia_evento_uanl',
    { p_evento: idEvento },
  );
  if (errorResumen) {
    console.error('[asistencia] No se pudo cargar el resumen:', errorResumen.message);
  }

  const resumenValidado = resumenAsistenciaSchema.safeParse(datosResumen);
  if (!resumenValidado.success && datosResumen !== null) {
    console.error(
      '[asistencia] Respuesta inesperada de la RPC de resumen:',
      resumenValidado.error.issues,
    );
  }
  const resumen = resumenValidado.success ? resumenValidado.data : null;

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900">Asistencia</h2>
        <p className="mt-1 text-sm text-slate-600">
          {esAdministrador
            ? 'Consulta de asistencias registradas en este evento.'
            : 'Registra la asistencia con el código del pase de cada participante.'}
        </p>
      </div>

      {evento.estatus === 'Cancelado' ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
        >
          Evento cancelado: no se puede registrar asistencia
        </div>
      ) : null}

      {evento.estatus !== 'Cancelado' &&
      !estatusPermiteRegistroAsistencia(evento.estatus) ? (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800"
        >
          {MENSAJE_ESTATUS_NO_PERMITIDO}
        </div>
      ) : null}

      {resumen ? <ResumenAsistencia resumen={resumen} /> : null}

      {puedeRegistrar ? <CapturaAsistencia idEvento={idEvento} /> : null}

      <TablaAsistencia asistencias={asistencias} />
    </section>
  );
}

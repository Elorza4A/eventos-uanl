'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { obtenerDetalleEvento } from '@/app/(equipo)/equipo/listado-eventos/data';
import {
  esquemaCapturaPase,
  estatusPermiteRegistroAsistencia,
  MENSAJE_ESTATUS_NO_PERMITIDO,
  resultadoAsistenciaSchema,
  type RespuestaAsistencia,
} from '@/app/(equipo)/equipo/listado-eventos/[idEvento]/asistencia/schemas';
import { getPerfil } from '@/lib/auth/perfil';
import { createClient } from '@/utils/supabase/server';

export async function registrarAsistencia(
  idEvento: number,
  pase: string,
): Promise<RespuestaAsistencia> {
  if (!Number.isSafeInteger(idEvento) || idEvento <= 0) {
    return { ok: false, error: 'El evento no es válido.' };
  }

  const codigo = esquemaCapturaPase.safeParse({ pase });
  if (!codigo.success) {
    return {
      ok: false,
      error:
        codigo.error.issues[0]?.message ?? 'Formato inválido. Ejemplo: 039A-213B',
    };
  }

  const perfil = await getPerfil();
  if (
    !perfil.user ||
    perfil.equipo?.rol !== 'Organizador' ||
    perfil.equipo.idDependencia === null
  ) {
    return { ok: false, error: 'No tienes permiso para registrar asistencia.' };
  }

  // La misma consulta con filtro por dependencia que protege el detalle.
  const evento = await obtenerDetalleEvento(idEvento, {
    esAdministrador: false,
    idDependencia: perfil.equipo.idDependencia,
  });
  if (!evento) {
    return { ok: false, error: 'No tienes permiso para registrar asistencia en este evento.' };
  }
  if (evento.estatus === 'Cancelado') {
    return { ok: false, error: 'Evento cancelado: no se puede registrar asistencia' };
  }
  if (!estatusPermiteRegistroAsistencia(evento.estatus)) {
    return { ok: false, error: MENSAJE_ESTATUS_NO_PERMITIDO };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.rpc('registrar_asistencia_pase_uanl', {
    p_evento: idEvento,
    p_pase: codigo.data.pase,
  });

  if (error) return { ok: false, error: error.message };

  const validado = resultadoAsistenciaSchema.safeParse(data);
  if (!validado.success) {
    return {
      ok: false,
      error: 'La respuesta del servidor no tiene el formato esperado.',
    };
  }

  if (validado.data.resultado === 'registrada') {
    revalidatePath(`/equipo/listado-eventos/${idEvento}/asistencia`);
  }

  return { ok: true, data: validado.data };
}

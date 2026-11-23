'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

import { getAsistenteActual, obtenerEstatusInscripcion } from '@/lib/eventos-db';
import { createClient } from '@/utils/supabase/server';

export type CancelacionResult = { ok: true } | { ok: false; message: string };

function mensajeAmigable(mensaje: string) {
  if (/día anterior/i.test(mensaje)) {
    return 'Solo puedes cancelar hasta el día anterior al evento.';
  }
  if (/no hay una inscripción activa/i.test(mensaje)) {
    return 'Tu inscripción ya no está activa o ya fue cancelada.';
  }
  if (/asistente inexistente/i.test(mensaje)) {
    return 'No encontramos tu perfil de asistente.';
  }
  if (/evento inexistente/i.test(mensaje)) {
    return 'El evento ya no existe.';
  }
  return mensaje;
}

/**
 * Cancela únicamente la inscripción del alumno autenticado.
 * La validación definitiva la hace la RPC cancelar_inscripcion_uanl en Supabase,
 * que usa auth.uid() y solo acepta inscripciones Activa.
 */
export async function cancelarInscripcionAction(
  idEvento: number,
): Promise<CancelacionResult> {
  if (!Number.isInteger(idEvento) || idEvento <= 0) {
    return { ok: false, message: 'No pudimos identificar el evento.' };
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Inicia sesión para cancelar tu inscripción.' };
  }

  const asistente = await getAsistenteActual();
  if (!asistente) {
    return { ok: false, message: 'No encontramos tu perfil de asistente.' };
  }

  const estatus = await obtenerEstatusInscripcion(idEvento, asistente.id);
  if (estatus !== 'Activa') {
    return { ok: false, message: 'Tu inscripción ya no está activa o ya fue cancelada.' };
  }

  const { error } = await supabase.rpc('cancelar_inscripcion_uanl', {
    p_evento: idEvento,
  });

  if (error) {
    return { ok: false, message: mensajeAmigable(error.message) };
  }

  revalidatePath('/mis-eventos');
  revalidatePath('/eventos');
  revalidatePath(`/eventos/${idEvento}`);
  revalidatePath('/');

  return { ok: true };
}

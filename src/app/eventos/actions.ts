'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

export type InscripcionResult =
  | { ok: true }
  | { ok: false; message: string };

/**
 * Inscribe al alumno autenticado usando la RPC segura de Supabase.
 * La creación de cuentas y del pase QR se queda fuera de este proyecto.
 */
export async function inscribirseAction(idEvento: number): Promise<InscripcionResult> {
  if (!Number.isInteger(idEvento) || idEvento <= 0) {
    return { ok: false, message: 'No pudimos identificar el evento.' };
  }

  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: 'Inicia sesión para poder inscribirte al evento.' };
  }

  const { error } = await supabase.rpc('inscribir_evento_uanl', { p_evento: idEvento });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath('/eventos');
  revalidatePath(`/eventos/${idEvento}`);
  revalidatePath('/mis-eventos');

  return { ok: true };
}

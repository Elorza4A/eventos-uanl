import 'server-only';

import { cookies } from 'next/headers';
import { z } from 'zod';

import { getPerfil } from '@/lib/auth/perfil';
import { createClient } from '@/utils/supabase/server';

import type { RolUsuarioEquipo, UsuarioEquipoFila } from './types';

const filaSchema = z.object({
  id_administrador: z.coerce.number().int(),
  nombre_admin: z.string().min(1),
  correo_admin: z.string().min(1),
  id_dependencia: z.coerce.number().int().nullable(),
  nombre_dependencia: z.string().nullable(),
  verificado: z.boolean(),
  invitado_en: z.string().nullable(),
});

/**
 * Toda la lectura (rol, dependencia y estado de verificación) la resuelve la
 * RPC. Solo un Administrador obtiene filas.
 */
export async function getUsuariosEquipo(
  rol: RolUsuarioEquipo,
): Promise<UsuarioEquipoFila[]> {
  const perfil = await getPerfil();
  if (!perfil.user || perfil.equipo?.rol !== 'Administrador') return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.rpc(
    'listar_usuarios_equipo_uanl',
    { p_rol: rol },
  );

  if (error) {
    console.error(`[usuarios] No se pudo cargar ${rol}:`, error.message);
    return [];
  }

  const validados = z.array(filaSchema).safeParse(data ?? []);
  if (!validados.success) {
    console.error(
      `[usuarios] Respuesta inesperada para ${rol}:`,
      validados.error.issues,
    );
    return [];
  }

  return validados.data.map((fila) => ({
    id_administrador: fila.id_administrador,
    nombre_admin: fila.nombre_admin.trim(),
    correo_admin: fila.correo_admin.trim(),
    id_dependencia: fila.id_dependencia,
    nombre_dependencia: fila.nombre_dependencia?.trim() || null,
    verificado: fila.verificado,
    invitado_en: fila.invitado_en,
  }));
}

import 'server-only';

import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import { isValidRole, type Role } from '@/config/permissions';

export type CurrentUser = {
  id: string;
  email: string;
  nombre: string | null;
  rol: Role;
};

/**
 * Capa de acceso a datos: única fuente de verdad para sesión y rol.
 * El rol se lee de `public.perfiles`, no del token, para que los cambios
 * de rol se reflejen de inmediato.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil, error } = await supabase
    .from('perfiles')
    .select('rol, nombre')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[dal] No se pudo leer el perfil del usuario:', error.message);
  }

  const rol: Role =
    !error && perfil && isValidRole(perfil.rol) ? perfil.rol : 'asistente';

  return {
    id: user.id,
    email: user.email ?? '',
    nombre: perfil?.nombre ?? null,
    rol,
  };
});

export async function requireUser(loginPath = '/login/asistente') {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  return user;
}

export async function requireRole(
  roles: readonly Role[],
  loginPath = '/login/asistente',
) {
  const user = await requireUser(loginPath);
  if (!roles.includes(user.rol)) redirect('/no-autorizado');
  return user;
}

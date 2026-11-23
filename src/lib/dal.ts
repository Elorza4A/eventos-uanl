import 'server-only';

import { redirect } from 'next/navigation';
import { cache } from 'react';

import type { Role } from '@/config/permissions';
import { getPerfil } from '@/lib/auth/perfil';

export type CurrentUser = {
  id: string;
  email: string;
  nombre: string | null;
  rol: Role;
};

/**
 * Adaptador del perfil nuevo al formato que ya consume la navegación.
 * El rol se resuelve en `getPerfil()` desde `administradores` / `asistentes`,
 * nunca desde cookies ni localStorage.
 */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const perfil = await getPerfil();
  if (!perfil.user) return null;

  return {
    id: perfil.user.id,
    email: perfil.user.email,
    nombre: perfil.equipo?.nombre ?? perfil.asistente?.nombre ?? null,
    rol: perfil.equipo?.rolInterno ?? 'asistente',
  };
});

export async function requireUser(loginPath = '/login') {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  return user;
}

export async function requireRole(
  roles: readonly Role[],
  loginPath = '/login',
) {
  const user = await requireUser(loginPath);
  if (!roles.includes(user.rol)) redirect('/no-autorizado');
  return user;
}

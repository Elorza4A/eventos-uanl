'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { createClient } from '@/utils/supabase/server';
import {
  getHomeForRole,
  getRouteRule,
  isValidRole,
  LOGIN_PORTALS,
  type LoginPortal,
  type Role,
} from '@/config/permissions';
import type { AuthState, RegisterState } from '@/types/auth';

/** Solo se aceptan rutas relativas y permitidas para el rol autenticado. */
function safeNext(next: string, rol: Role): string | null {
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  const pathname = next.split('?')[0];
  const rule = getRouteRule(pathname);
  if (!rule || !rule.roles.includes(rol)) return null;
  return next;
}

async function authenticate(
  _state: AuthState,
  formData: FormData,
  portal: LoginPortal,
): Promise<AuthState> {
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '');

  if (!email || !password) {
    return { error: 'Ingresa tu correo y contraseña.' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.user) {
    return { error: 'Correo o contraseña incorrectos.' };
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('rol')
    .eq('id', data.user.id)
    .maybeSingle();

  if (perfilError) {
    await supabase.auth.signOut();
    return { error: 'No fue posible verificar tu perfil. Intenta de nuevo.' };
  }

  const rol: Role = perfil && isValidRole(perfil.rol) ? perfil.rol : 'asistente';

  // Credenciales válidas pero rol equivocado: se cierra la sesión creada para
  // que no quede activa ninguna cookie del portal equivocado.
  if (!LOGIN_PORTALS[portal].roles.includes(rol)) {
    await supabase.auth.signOut();
    return {
      error: `Esta cuenta no tiene acceso al portal de ${LOGIN_PORTALS[portal].label}.`,
    };
  }

  redirect(safeNext(next, rol) ?? getHomeForRole(rol));
}

export async function loginAsistente(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  return authenticate(state, formData, 'asistente');
}

export async function loginEquipo(
  state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  return authenticate(state, formData, 'equipo');
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  await supabase.auth.signOut();
  redirect('/');
}

export async function registerAsistente(
  _state: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  const nombre = String(formData.get('nombre') ?? '').trim();
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!nombre || !email || !password) {
    return { error: 'Completa todos los campos.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nombre },
    },
  });

  if (error) {
    return { error: error.message };
  }

  // Si la confirmación de correo está desactivada, Supabase ya creó la sesión.
  if (data.session) {
    redirect('/mis-eventos');
  }

  return {
    success: 'Tu cuenta fue creada. Revisa tu correo para confirmarla antes de entrar.',
  };
}

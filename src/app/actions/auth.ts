'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { getHomeForRole, getRouteRule, type Role } from '@/config/permissions';
import { resolvePerfil } from '@/lib/auth/perfil';
import type { AuthState, RegisterState } from '@/types/auth';
import { createClient } from '@/utils/supabase/server';

/** Solo se aceptan rutas relativas y permitidas para el rol autenticado. */
function safeNext(next: string, rol: Role): string | null {
  if (!next.startsWith('/') || next.startsWith('//') || next.startsWith('\\')) {
    return null;
  }
  const pathname = next.split('?')[0];
  const rule = getRouteRule(pathname);
  if (!rule || !rule.roles.includes(rol)) return null;
  return next;
}

function loginError(message: string): string {
  if (/invalid login credentials|invalid email or password/i.test(message)) {
    return 'Correo o contraseña incorrectos.';
  }
  if (/email not confirmed/i.test(message)) {
    return 'Confirma tu correo antes de iniciar sesión.';
  }
  return 'No fue posible iniciar sesión. Intenta de nuevo.';
}

async function authenticate(
  _state: AuthState,
  formData: FormData,
  portal: 'asistente' | 'equipo',
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
    return { error: loginError(error?.message ?? '') };
  }

  let perfil;
  try {
    perfil = await resolvePerfil(supabase, data.user);
  } catch (perfilError) {
    console.error('[auth] No se pudo resolver el perfil:', perfilError);
    await supabase.auth.signOut();
    return { error: 'No fue posible verificar tu perfil. Intenta de nuevo.' };
  }

  if (portal === 'equipo') {
    if (!perfil.equipo) {
      await supabase.auth.signOut();
      return { error: 'Esta cuenta no tiene acceso al equipo' };
    }
    const rol = perfil.equipo.rolInterno;
    redirect(safeNext(next, rol) ?? getHomeForRole(rol));
  }

  if (!perfil.asistente) {
    if (perfil.equipo) {
      await supabase.auth.signOut();
      return {
        error: 'Esta cuenta pertenece al equipo. Usa el acceso de Equipo.',
      };
    }
    redirect('/completar-perfil');
  }

  redirect(safeNext(next, 'asistente') ?? '/eventos');
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

  if (data.session) {
    redirect('/inicio');
  }

  return {
    success: 'Tu cuenta fue creada. Revisa tu correo para confirmarla antes de entrar.',
  };
}

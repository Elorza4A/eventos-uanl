'use server';

import { cookies, headers } from 'next/headers';
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

    if (portal === 'asistente' && !perfil.asistente) {
      const metadata = data.user.user_metadata;
      const comoNumero = (valor: unknown) =>
        typeof valor === 'number' && Number.isFinite(valor) ? valor : null;
      const nombre =
        typeof metadata.nombre === 'string' ? metadata.nombre : '';

      const { error: perfilError } = await supabase.rpc(
        'registrar_asistente_uanl',
        {
          p_nombre: nombre,
          p_id_facultad: comoNumero(metadata.id_facultad),
          p_id_estado: comoNumero(metadata.id_estado),
          p_id_municipio: comoNumero(metadata.id_municipio),
          p_edad: comoNumero(metadata.edad),
          p_id_genero: comoNumero(metadata.id_genero),
          p_direccion: null,
        },
      );

      if (perfilError) throw perfilError;
      perfil = await resolvePerfil(supabase, data.user);
    }
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
  const estado = String(formData.get('estado') ?? '').trim();
  const municipio = String(formData.get('municipio') ?? '').trim();
  const facultad = String(formData.get('facultad') ?? '').trim();
  const edad = String(formData.get('edad') ?? '').trim();
  const genero = String(formData.get('genero') ?? '').trim();

  if (!nombre || !email || !password) {
    return { error: 'Completa todos los campos.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }
  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' };
  }

  const idEstado = estado ? Number(estado) : null;
  const idMunicipio = municipio ? Number(municipio) : null;
  const idFacultad = facultad ? Number(facultad) : null;
  const edadAsistente = edad ? Number(edad) : null;
  const idGenero = genero ? Number(genero) : null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const requestHeaders = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    requestHeaders.get('origin') ??
    'http://localhost:3000';

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nombre,
        id_estado: idEstado,
        id_municipio: idMunicipio,
        id_facultad: idFacultad,
        edad: edadAsistente,
        id_genero: idGenero,
      },
      emailRedirectTo: `${origin}/auth/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  if (data.session) {
    const { error: perfilError } = await supabase.rpc(
      'registrar_asistente_uanl',
      {
        p_nombre: nombre,
        p_id_facultad: idFacultad,
        p_id_estado: idEstado,
        p_id_municipio: idMunicipio,
        p_edad: edadAsistente,
        p_id_genero: idGenero,
        p_direccion: null,
      },
    );

    if (perfilError) {
      await supabase.auth.signOut();
      return { error: perfilError.message };
    }

    redirect('/inicio');
  }

  return {
    success: 'Tu cuenta fue creada. Revisa tu correo para confirmarla antes de entrar.',
  };
}

/** Guarda la contraseña del invitado después de que Supabase confirmó el enlace. */
export async function establecerContrasena(
  _state: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const password = String(formData.get('password') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (password.length < 8) {
    return { error: 'La contraseña debe tener al menos 8 caracteres.' };
  }
  if (password !== confirmPassword) {
    return { error: 'Las contraseñas no coinciden.' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Tu enlace expiró. Solicita una nueva invitación.' };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    console.error('[auth] No se pudo establecer la contraseña:', error.message);
    return { error: 'No se pudo guardar la contraseña. Intenta de nuevo.' };
  }

  redirect('/equipo');
}

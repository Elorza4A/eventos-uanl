'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { getPerfil } from '@/lib/auth/perfil';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  esquemaAdministrador,
  esquemaOrganizador,
  type ValoresUsuarioEquipo,
} from '@/lib/validations/usuario-equipo';
import type { ResultadoUsuarioEquipo } from '@/types/usuarios-equipo';
import { createClient } from '@/utils/supabase/server';

const ERROR_GENERICO =
  'No se pudo completar la invitación. Intenta de nuevo.';
const ERROR_CONFIG_URL =
  'Falta configurar la URL del sitio para poder enviar invitaciones.';
const ERROR_CONFIG_ADMIN =
  'Falta configurar el acceso de administración para poder enviar invitaciones.';
const ERROR_LIMITE_REENVIO =
  'Se alcanzó el límite de correos; espera un momento e inténtalo de nuevo';

/** El modelo no usa un único nombre para la llave de Auth en `administradores`. */
const COLUMNAS_AUTH_USER = [
  'auth_user_id',
  'id_usuario',
  'id_auth_user',
  'id_user',
  'user_id',
] as const;

const esquemaIdAdministrador = z.coerce.number().int().positive();

function mensajeDe(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object' && 'message' in error) {
    const mensaje = (error as { message?: unknown }).message;
    if (typeof mensaje === 'string') return mensaje;
  }
  return '';
}

function codigoDe(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    const codigo = (error as { code?: unknown }).code;
    if (typeof codigo === 'string') return codigo;
  }
  return '';
}

function esColumnaAusente(mensaje: string): boolean {
  return (
    /42703|PGRST204/i.test(mensaje) ||
    /does not exist/i.test(mensaje) ||
    /could not find the .* column/i.test(mensaje)
  );
}

function mapearError(error: unknown): string {
  const mensaje = mensajeDe(error);
  const codigo = codigoDe(error);

  if (codigo === '23505') return 'Este usuario ya pertenece al equipo.';
  if (
    /already registered|already been registered|email.*already.*(registered|exists)|user already exists/i.test(
      mensaje,
    )
  ) {
    return 'Ya existe una cuenta con ese correo';
  }
  if (
    /rate.?limit|too many requests|email.*limit|exceeded.*(email|send)|unable to (send|email)/i.test(
      mensaje,
    )
  ) {
    return 'Se alcanzó el límite de correos; intenta más tarde';
  }

  console.error('[usuarios] Error al invitar al equipo:', mensaje || error);
  return ERROR_GENERICO;
}

function mapearErrorReenvio(error: unknown): string {
  const mensaje = mensajeDe(error);
  if (
    /rate.?limit|too many requests|only request this after|retry|after\s+\d+\s*(s|sec|seconds)|wait\s+\d+\s*(s|sec|seconds)|email.*(limit|quota)|exceeded.*(email|send)/i.test(
      mensaje,
    )
  ) {
    return ERROR_LIMITE_REENVIO;
  }
  // El resto de errores conocidos (por ejemplo, correo ya registrado) se
  // traduce con el mismo mapa que el alta; nunca se exponen detalles internos.
  return mapearError(error);
}

type ConfiguracionInvitacion =
  | {
      ok: true;
      redirectTo: string;
      admin: ReturnType<typeof createAdminClient>;
    }
  | { ok: false; error: string };

/**
 * Prepara todo lo necesario para invitar. La URL sale solo de configuración,
 * nunca de headers, y los problemas de configuración se distinguen de los
 * fallos reales de envío de correo.
 */
function configuracionInvitacion(): ConfiguracionInvitacion {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (!siteUrl) {
    console.error('[usuarios] Falta NEXT_PUBLIC_SITE_URL para la invitación.');
    return { ok: false, error: ERROR_CONFIG_URL };
  }

  const redirectTo = `${siteUrl.replace(/\/+$/, '')}/auth/confirm?next=/establecer-contrasena`;

  try {
    return { ok: true, redirectTo, admin: createAdminClient() };
  } catch (error) {
    console.error(
      '[usuarios] No se pudo crear el cliente de administración:',
      error,
    );
    return { ok: false, error: ERROR_CONFIG_ADMIN };
  }
}

function revalidarListados() {
  revalidatePath('/equipo/usuarios/administrador');
  revalidatePath('/equipo/usuarios/organizador');
}

async function esAdministrador(): Promise<boolean> {
  // getPerfil() resuelve la sesión con auth.getUser() y el rol desde la BD.
  const perfil = await getPerfil();
  return Boolean(perfil.user && perfil.equipo?.rol === 'Administrador');
}

async function dependenciaExiste(idDependencia: number): Promise<boolean> {
  const cookieStore = await cookies();
  // Cliente de la sesión del administrador: las RPC también lo usan.
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase
    .from('dependencia')
    .select('id_dependencia')
    .eq('id_dependencia', idDependencia)
    .maybeSingle();

  return !error && data !== null;
}

type AdministradorEncontrado = {
  authUserId: string;
  correo: string;
};

/** Busca la fila usando el cliente de sesión; el cliente no aporta correo ni id de Auth. */
async function buscarAdministrador(
  idAdministrador: number,
): Promise<AdministradorEncontrado | null> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  for (const columna of COLUMNAS_AUTH_USER) {
    const { data, error } = await supabase
      .from('administradores')
      .select(`id_administrador, correo_admin, ${columna}`)
      .eq('id_administrador', idAdministrador)
      .maybeSingle();

    if (!error) {
      const fila = data as Record<string, unknown> | null;
      if (!fila) return null;

      const authUserId = fila[columna];
      const correo = fila.correo_admin;
      if (
        typeof authUserId !== 'string' ||
        authUserId === '' ||
        typeof correo !== 'string' ||
        correo === ''
      ) {
        return null;
      }
      return { authUserId, correo };
    }

    if (!esColumnaAusente(error.message)) {
      console.error(
        '[usuarios] No se pudo buscar el administrador:',
        error.message,
      );
      return null;
    }
  }

  return null;
}

type DatosAltas = {
  rol: 'Administrador' | 'Organizador';
  nombre: string;
  correo: string;
  idDependencia: number | null;
};

async function invitarYRegistrar({
  rol,
  nombre,
  correo,
  idDependencia,
}: DatosAltas): Promise<ResultadoUsuarioEquipo> {
  const configuracion = configuracionInvitacion();
  if (!configuracion.ok) {
    return { ok: false, error: configuracion.error };
  }
  const { admin, redirectTo } = configuracion;

  const { data: invitacion, error: errorInvitacion } =
    await admin.auth.admin.inviteUserByEmail(correo, { redirectTo });

  const idAuth = invitacion.user?.id;
  if (errorInvitacion || !idAuth) {
    return { ok: false, error: mapearError(errorInvitacion ?? ERROR_GENERICO) };
  }

  const cookieStore = await cookies();
  // La RPC comprueba auth.uid(): debe ejecutarse con la sesión del administrador.
  const supabase = createClient(cookieStore);
  const { error: errorAlta } =
    rol === 'Organizador'
      ? await supabase.rpc('alta_organizador_uanl', {
          p_auth_user_id: idAuth,
          p_nombre: nombre,
          p_id_dependencia: idDependencia,
        })
      : await supabase.rpc('alta_administrador_uanl', {
          p_auth_user_id: idAuth,
          p_nombre: nombre,
        });

  if (errorAlta) {
    const { error: errorRollback } = await admin.auth.admin.deleteUser(idAuth);
    if (errorRollback) {
      console.error(
        '[usuarios] No se pudo eliminar el usuario invitado tras fallar el alta:',
        errorRollback.message,
      );
    }
    return { ok: false, error: mapearError(errorAlta) };
  }

  revalidatePath(
    rol === 'Administrador'
      ? '/equipo/usuarios/administrador'
      : '/equipo/usuarios/organizador',
  );

  return { ok: true };
}

export async function crearAdministrador(
  input: ValoresUsuarioEquipo,
): Promise<ResultadoUsuarioEquipo> {
  if (!(await esAdministrador())) {
    return { ok: false, error: 'No autorizado' };
  }

  const validacion = esquemaAdministrador.safeParse(input);
  if (!validacion.success) {
    return {
      ok: false,
      error: validacion.error.issues[0]?.message ?? 'Revisa los datos.',
    };
  }

  const { nombre, correo } = validacion.data;
  return invitarYRegistrar({
    rol: 'Administrador',
    nombre,
    correo,
    idDependencia: null,
  });
}

export async function crearOrganizador(
  input: ValoresUsuarioEquipo,
): Promise<ResultadoUsuarioEquipo> {
  if (!(await esAdministrador())) {
    return { ok: false, error: 'No autorizado' };
  }

  const validacion = esquemaOrganizador.safeParse(input);
  if (!validacion.success) {
    return {
      ok: false,
      error: validacion.error.issues[0]?.message ?? 'Revisa los datos.',
    };
  }

  const { nombre, correo, id_dependencia } = validacion.data;
  if (!(await dependenciaExiste(id_dependencia))) {
    return { ok: false, error: 'La dependencia seleccionada no existe.' };
  }

  return invitarYRegistrar({
    rol: 'Organizador',
    nombre,
    correo,
    idDependencia: id_dependencia,
  });
}

export async function reenviarInvitacion(
  idAdministrador: number,
): Promise<ResultadoUsuarioEquipo> {
  if (!(await esAdministrador())) {
    return { ok: false, error: 'No autorizado' };
  }

  const validacion = esquemaIdAdministrador.safeParse(idAdministrador);
  if (!validacion.success) {
    return { ok: false, error: 'El usuario no es válido.' };
  }

  const administrador = await buscarAdministrador(validacion.data);
  if (!administrador) {
    return { ok: false, error: 'Usuario no encontrado' };
  }

  const configuracion = configuracionInvitacion();
  if (!configuracion.ok) {
    return { ok: false, error: configuracion.error };
  }
  const { admin, redirectTo } = configuracion;

  const { data: usuarioAuth, error: errorAuth } =
    await admin.auth.admin.getUserById(administrador.authUserId);
  if (errorAuth || !usuarioAuth.user) {
    return { ok: false, error: 'Usuario no encontrado' };
  }

  if (usuarioAuth.user.email_confirmed_at !== null) {
    revalidarListados();
    return { ok: false, error: 'Este usuario ya verificó su cuenta' };
  }

  const { error: errorInvitacion } = await admin.auth.admin.inviteUserByEmail(
    administrador.correo,
    { redirectTo },
  );
  if (errorInvitacion) {
    return { ok: false, error: mapearErrorReenvio(errorInvitacion) };
  }

  revalidarListados();
  return { ok: true };
}

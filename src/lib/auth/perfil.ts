import 'server-only';

import { cookies } from 'next/headers';
import { cache } from 'react';

import type {
  PerfilAsistente,
  PerfilAuth,
  PerfilEquipo,
  RolEquipo,
} from '@/types/database';
import { createClient } from '@/utils/supabase/server';

type DbClient = ReturnType<typeof createClient>;
type AuthUser = { id: string; email?: string | null };
type DbRow = Record<string, unknown>;

/**
 * El modelo nuevo no comparte un único nombre para la llave del usuario de
 * Auth. Se prueba una lista corta y se guarda la columna encontrada por tabla
 * para no repetir el sondeo en cada petición.
 */
const AUTH_USER_COLUMNS = [
  'auth_user_id',
  'id_usuario',
  'id_auth_user',
  'id_user',
  'user_id',
] as const;

const authColumnByTable: Record<string, string | null> = {};

function isMissingColumn(message: string): boolean {
  return (
    /42703|PGRST204/i.test(message) ||
    /does not exist/i.test(message) ||
    /could not find the .* column/i.test(message)
  );
}

function isSingle(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function comoEntero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

function comoTexto(valor: unknown): string | null {
  return typeof valor === 'string' && valor.trim() !== '' ? valor : null;
}

async function findOwnRow(
  supabase: DbClient,
  table: 'administradores' | 'asistentes',
  userId: string,
  select = '*',
): Promise<DbRow | null> {
  const cached = authColumnByTable[table];
  const candidates = cached ? [cached] : AUTH_USER_COLUMNS;
  let lastError: Error | null = null;

  for (const column of candidates) {
    const { data, error } = await supabase
      .from(table)
      .select(select)
      .eq(column, userId)
      .maybeSingle();

    if (!error) {
      authColumnByTable[table] = column;
      return isSingle(data) ? data : null;
    }

    lastError = new Error(error.message);
    if (cached || !isMissingColumn(error.message)) break;
  }

  if (lastError) throw lastError;
  return null;
}

function normalizeRol(value: unknown): RolEquipo | null {
  if (value === 'Administrador' || value === 'admin') return 'Administrador';
  if (value === 'Organizador' || value === 'organizador') return 'Organizador';
  return null;
}

async function resolveEquipo(
  supabase: DbClient,
  userId: string,
): Promise<PerfilEquipo | null> {
  let row: DbRow | null;

  try {
    row = await findOwnRow(
      supabase,
      'administradores',
      userId,
      '*, roles_administradores ( nombre_rol )',
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!/embed|relationship/i.test(message)) throw error;
    row = await findOwnRow(supabase, 'administradores', userId);
  }

  if (!row) return null;

  const relation = row.roles_administradores;
  const candidato = Array.isArray(relation)
    ? isSingle(relation[0])
      ? relation[0].nombre_rol
      : undefined
    : isSingle(relation)
      ? relation.nombre_rol
      : undefined;
  const rol = normalizeRol(candidato ?? row.nombre_rol);
  if (!rol) return null;

  const idDependencia = comoEntero(row.id_dependencia);

  return {
    rol,
    rolInterno: rol === 'Administrador' ? 'admin' : 'organizador',
    idAdministrador: comoEntero(row.id_administrador ?? row.id),
    idDependencia,
    nombre: comoTexto(row.nombre_admin ?? row.nombre_administrador ?? row.nombre),
  };
}

async function resolveAsistente(
  supabase: DbClient,
  userId: string,
): Promise<PerfilAsistente | null> {
  const row = await findOwnRow(supabase, 'asistentes', userId);
  if (!row) return null;

  const id = row.id_asistente ?? row.id;
  const idPase = row.id_pase ?? row.id_pase_asistente;
  const interno = row.interno ?? row.es_interno;

  return {
    idAsistente: id === null || id === undefined ? '' : String(id),
    nombre: typeof row.nombre === 'string' ? row.nombre : null,
    idPase: idPase === null || idPase === undefined ? null : String(idPase),
    interno: interno === true || interno === 1 || interno === 'true',
  };
}

/** Resuelve sesión y perfiles leyendo siempre de la base de datos. */
export async function resolvePerfil(
  supabase: DbClient,
  user: AuthUser,
): Promise<PerfilAuth> {
  const [equipo, asistente] = await Promise.all([
    resolveEquipo(supabase, user.id),
    resolveAsistente(supabase, user.id),
  ]);

  return {
    user: { id: user.id, email: user.email ?? '' },
    equipo,
    asistente,
  };
}

/** Versión por petición para Server Components y Server Actions. */
export const getPerfil = cache(async (): Promise<PerfilAuth> => {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { user: null, equipo: null, asistente: null };

  return resolvePerfil(supabase, user);
});

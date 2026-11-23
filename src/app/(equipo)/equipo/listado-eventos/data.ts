import 'server-only';

import { cookies } from 'next/headers';

import type {
  DependenciaOpcion,
  DetalleEvento,
  EventoParaCancelacion,
} from '@/types/eventos';
import { createClient } from '@/utils/supabase/server';

import type { EventoFila } from './types';
import { calcularEstatusEvento, textoOGuion } from './utils';

type Relacion = Record<string, unknown>;

type EventoRow = {
  id_evento: number | string;
  nombre_evento: string | null;
  descripcion_evento?: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  direccion_evento?: string | null;
  imagen_url?: string | null;
  cupo_maximo: number | null;
  fecha_creacion?: string | null;
  id_administrador?: number | string | null;
  id_dependencia: number | string | null;
  estatus_eventos: unknown;
  dependencia: unknown;
  administradores: unknown;
};

function primerRegistro(valor: unknown): Relacion | null {
  if (Array.isArray(valor)) {
    const primero = valor[0];
    return primero && typeof primero === 'object' ? (primero as Relacion) : null;
  }
  return valor && typeof valor === 'object' ? (valor as Relacion) : null;
}

function texto(valor: unknown): string | null {
  return typeof valor === 'string' ? valor : null;
}

function entero(valor: number | string | null | undefined): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export type FiltroEventos = {
  esAdministrador: boolean;
  idDependencia: number | null;
};

function dependenciaInvalida(filtro: FiltroEventos): boolean {
  return !filtro.esAdministrador && filtro.idDependencia === null;
}

/**
 * Un Organizador sin dependencia no ve eventos: nunca se interpreta como
 * "sin filtro", que está reservado al Administrador. El filtro se aplica aquí,
 * en servidor, porque RLS no restringe la lectura de eventos.
 */
export async function obtenerEventos(
  filtro: FiltroEventos,
): Promise<EventoFila[]> {
  if (dependenciaInvalida(filtro)) return [];

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase.from('eventos').select(`
      id_evento, nombre_evento, fecha_inicio, fecha_fin, cupo_maximo, id_dependencia,
      estatus_eventos ( nombre_estatus ),
      dependencia ( nombre_dependencia ),
      administradores ( nombre_admin )
    `);

  if (!filtro.esAdministrador && filtro.idDependencia !== null) {
    query = query.eq('id_dependencia', filtro.idDependencia);
  }

  const { data, error } = await query.order('fecha_inicio', { ascending: false });

  if (error) {
    console.error('[eventos] No se pudo cargar el listado:', error.message);
    return [];
  }

  return ((data ?? []) as unknown as EventoRow[]).flatMap((row) => {
    const idEvento = entero(row.id_evento);
    if (idEvento === null) return [];

    const estatus = primerRegistro(row.estatus_eventos);
    const dependencia = primerRegistro(row.dependencia);
    const administrador = primerRegistro(row.administradores);

    const fila: EventoFila = {
      idEvento,
      nombreEvento: textoOGuion(row.nombre_evento),
      fechaInicio: row.fecha_inicio,
      fechaFin: row.fecha_fin,
      cupoMaximo: row.cupo_maximo,
      idDependencia: entero(row.id_dependencia),
      dependencia: textoOGuion(texto(dependencia?.nombre_dependencia)),
      organizador: textoOGuion(texto(administrador?.nombre_admin)),
      estatus: calcularEstatusEvento(
        texto(estatus?.nombre_estatus),
        row.fecha_inicio,
        row.fecha_fin,
      ),
    };

    return [fila];
  });
}

/** Detalle con el mismo filtro por dependencia que el listado. */
export async function obtenerEventoPorId(
  idEvento: number,
  filtro: FiltroEventos,
): Promise<{ idEvento: number; nombreEvento: string } | null> {
  if (dependenciaInvalida(filtro)) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('eventos')
    .select('id_evento, nombre_evento, id_dependencia')
    .eq('id_evento', idEvento);

  if (!filtro.esAdministrador && filtro.idDependencia !== null) {
    query = query.eq('id_dependencia', filtro.idDependencia);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) return null;

  return {
    idEvento,
    nombreEvento: textoOGuion(texto((data as EventoRow).nombre_evento)),
  };
}

export async function obtenerDetalleEvento(
  idEvento: number,
  filtro: FiltroEventos,
): Promise<DetalleEvento | null> {
  if (dependenciaInvalida(filtro)) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('eventos')
    .select(`
      id_evento, nombre_evento, descripcion_evento, fecha_inicio, fecha_fin,
      direccion_evento, imagen_url, cupo_maximo, fecha_creacion,
      id_administrador, id_dependencia,
      estatus_eventos ( nombre_estatus ),
      dependencia ( nombre_dependencia ),
      administradores ( nombre_admin )
    `)
    .eq('id_evento', idEvento);

  if (!filtro.esAdministrador && filtro.idDependencia !== null) {
    query = query.eq('id_dependencia', filtro.idDependencia);
  }

  const { data, error } = await query.maybeSingle();

  if (error || !data) {
    if (error) console.error('[eventos] No se pudo cargar el detalle:', error.message);
    return null;
  }

  const row = data as EventoRow;
  const estatusGuardado = texto(primerRegistro(row.estatus_eventos)?.nombre_estatus);
  const dependencia = texto(primerRegistro(row.dependencia)?.nombre_dependencia);
  const administrador = texto(primerRegistro(row.administradores)?.nombre_admin);

  return {
    idEvento: entero(row.id_evento) ?? idEvento,
    nombreEvento: textoOGuion(row.nombre_evento),
    descripcion: texto(row.descripcion_evento),
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    direccion: texto(row.direccion_evento),
    imagenUrl: texto(row.imagen_url),
    cupoMaximo: row.cupo_maximo,
    fechaCreacion: texto(row.fecha_creacion),
    idAdministrador: entero(row.id_administrador),
    idDependencia: entero(row.id_dependencia),
    dependencia: textoOGuion(dependencia),
    organizador: textoOGuion(administrador),
    estatusGuardado,
    estatus: calcularEstatusEvento(
      estatusGuardado,
      row.fecha_inicio,
      row.fecha_fin,
    ),
  };
}

/** Lectura usada por la acción de cancelación para revocar permisos en servidor. */
export async function obtenerEventoParaCancelacion(
  idEvento: number,
  filtro: FiltroEventos,
): Promise<EventoParaCancelacion | null> {
  if (dependenciaInvalida(filtro)) return null;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  let query = supabase
    .from('eventos')
    .select(`
      id_evento, id_administrador, id_dependencia, fecha_inicio, fecha_fin,
      estatus_eventos ( nombre_estatus )
    `)
    .eq('id_evento', idEvento);

  if (!filtro.esAdministrador && filtro.idDependencia !== null) {
    query = query.eq('id_dependencia', filtro.idDependencia);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;

  const row = data as EventoRow;
  return {
    idEvento: entero(row.id_evento) ?? idEvento,
    idAdministrador: entero(row.id_administrador),
    idDependencia: entero(row.id_dependencia),
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    estatusGuardado: texto(primerRegistro(row.estatus_eventos)?.nombre_estatus),
  };
}

export async function obtenerDependencias(): Promise<DependenciaOpcion[]> {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from('dependencia')
    .select('id_dependencia, nombre_dependencia')
    .order('nombre_dependencia', { ascending: true });

  if (error) {
    console.error('[dependencia] No se pudo cargar el catálogo:', error.message);
    return [];
  }

  return ((data ?? []) as unknown as Relacion[]).flatMap((row) => {
    const idDependencia = entero(
      typeof row.id_dependencia === 'number' || typeof row.id_dependencia === 'string'
        ? row.id_dependencia
        : null,
    );
    const nombreDependencia = texto(row.nombre_dependencia);
    if (idDependencia === null || !nombreDependencia) return [];
    return [{ idDependencia, nombreDependencia }];
  });
}

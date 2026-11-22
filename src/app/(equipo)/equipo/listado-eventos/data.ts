import 'server-only';

import { cookies } from 'next/headers';

import type { EventoFila } from './types';
import { calcularEstatusEvento, textoOGuion } from './utils';
import { createClient } from '@/utils/supabase/server';

type Relacion = Record<string, unknown>;

type EventoRow = {
  id_evento: number | string;
  nombre_evento: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  cupo_maximo: number | null;
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

function entero(valor: number | string | null): number | null {
  if (valor === null) return null;
  const numero = typeof valor === 'number' ? valor : Number(valor);
  return Number.isFinite(numero) ? numero : null;
}

export type FiltroEventos = {
  esAdministrador: boolean;
  idDependencia: number | null;
};

/**
 * Un Organizador sin dependencia no ve eventos: nunca se interpreta como
 * "sin filtro", que está reservado al Administrador. El filtro se aplica aquí,
 * en servidor, porque RLS no restringe la lectura de eventos.
 */
export async function obtenerEventos(
  filtro: FiltroEventos,
): Promise<EventoFila[]> {
  if (!filtro.esAdministrador && filtro.idDependencia === null) return [];

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
  if (!filtro.esAdministrador && filtro.idDependencia === null) return null;

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

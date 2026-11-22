import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';

/**
 * Acceso a los eventos desde la vista pública de Supabase.
 * Los datos de demostración de `src/data/events.ts` se dejan intactos para el inicio.
 */

export type EventoDb = {
  id: number;
  nombre: string;
  descripcion: string;
  fechaInicio: string;
  fechaFin: string;
  direccion: string;
  imagenUrl: string | null;
  cupoMaximo: number;
  fechaCreacion: string;
  dependenciaId: number;
  estatus: string;
  dependencia?: string;
};

export type AsistenteActual = {
  id: number;
  nombre: string;
  correo: string;
  pase: string;
};

export type InscripcionDb = {
  idEvento: number;
  estatus: string;
  fechaInscripcion: string;
};

type EventoPublicoRow = {
  id_evento: number;
  nombre_evento: string;
  descripcion_evento: string | null;
  fecha_inicio: string;
  fecha_fin: string;
  direccion_evento: string | null;
  imagen_url: string | null;
  cupo_maximo: number;
  fecha_creacion: string;
  id_dependencia: number;
  estatus_actual: string;
};

type InscripcionRow = {
  id_evento: number;
  fecha_inscripcion: string;
  estatus_inscripcion: { nombre_estatus: string } | { nombre_estatus: string }[] | null;
};

const EVENTO_COLUMNS =
  'id_evento,nombre_evento,descripcion_evento,fecha_inicio,fecha_fin,direccion_evento,imagen_url,cupo_maximo,fecha_creacion,id_dependencia,estatus_actual';

function mapEvento(row: EventoPublicoRow): EventoDb {
  return {
    id: Number(row.id_evento),
    nombre: row.nombre_evento,
    descripcion: row.descripcion_evento ?? '',
    fechaInicio: row.fecha_inicio,
    fechaFin: row.fecha_fin,
    direccion: row.direccion_evento ?? '',
    imagenUrl: row.imagen_url,
    cupoMaximo: Number(row.cupo_maximo),
    fechaCreacion: row.fecha_creacion,
    dependenciaId: Number(row.id_dependencia),
    estatus: row.estatus_actual,
  };
}

function nombreEstatus(row: InscripcionRow): string {
  const relacion = row.estatus_inscripcion;
  if (Array.isArray(relacion)) return relacion[0]?.nombre_estatus ?? '';
  return relacion?.nombre_estatus ?? '';
}

async function getSupabase() {
  return createClient(await cookies());
}

/** Lista los eventos publicados. Si falla la consulta, devuelve el mensaje de error. */
export async function getEventosPublicos(): Promise<{
  eventos: EventoDb[];
  error: string | null;
}> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('eventos_publicos')
    .select(EVENTO_COLUMNS)
    .order('fecha_inicio', { ascending: true });

  if (error) {
    console.error('[eventos] Error al consultar eventos_publicos:', error.message);
    return { eventos: [], error: error.message };
  }

  return { eventos: ((data ?? []) as EventoPublicoRow[]).map(mapEvento), error: null };
}

/** Obtiene un evento por su id. */
export async function getEventoPublico(id: number): Promise<{
  evento: EventoDb | null;
  error: string | null;
}> {
  if (!Number.isInteger(id) || id <= 0) return { evento: null, error: null };

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('eventos_publicos')
    .select(EVENTO_COLUMNS)
    .eq('id_evento', id)
    .maybeSingle();

  if (error) {
    console.error('[eventos] Error al consultar el evento:', error.message);
    return { evento: null, error: error.message };
  }

  if (!data) return { evento: null, error: null };

  const evento = mapEvento(data as EventoPublicoRow);
  const { data: dependencia } = await supabase
    .from('dependencia')
    .select('nombre_dependencia')
    .eq('id_dependencia', evento.dependenciaId)
    .maybeSingle();

  evento.dependencia = dependencia?.nombre_dependencia ?? 'Dependencia UANL';
  return { evento, error: null };
}

/** Datos básicos del alumno autenticado, necesarios para confirmar la asistencia. */
export async function getAsistenteActual(): Promise<AsistenteActual | null> {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('asistentes')
    .select('id_asistente,nombre_asistente,correo_asistente,id_pase')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (error) {
    console.error('[asistentes] Error al consultar el perfil:', error.message);
    return null;
  }

  if (!data) return null;

  return {
    id: Number(data.id_asistente),
    nombre: data.nombre_asistente,
    correo: data.correo_asistente,
    pase: data.id_pase,
  };
}

/** Inscripciones del alumno, con el estatus legible de cada una. */
export async function getInscripcionesDeAsistente(
  idAsistente: number,
): Promise<InscripcionDb[]> {
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from('inscripciones')
    .select('id_evento,fecha_inscripcion,estatus_inscripcion(nombre_estatus)')
    .eq('id_asistente', idAsistente)
    .order('fecha_inscripcion', { ascending: false });

  if (error) {
    console.error('[inscripciones] Error al consultar las inscripciones:', error.message);
    return [];
  }

  return ((data ?? []) as unknown as InscripcionRow[]).map((row) => ({
    idEvento: Number(row.id_evento),
    estatus: nombreEstatus(row),
    fechaInscripcion: row.fecha_inscripcion,
  }));
}

/** Indica si el alumno ya tiene una inscripción vigente o asistida en el evento. */
export async function yaEstaInscrito(
  idEvento: number,
  idAsistente: number | null,
): Promise<boolean> {
  if (!idAsistente) return false;

  const supabase = await getSupabase();
  const { data } = await supabase
    .from('inscripciones')
    .select('id_evento,fecha_inscripcion,estatus_inscripcion(nombre_estatus)')
    .eq('id_evento', idEvento)
    .eq('id_asistente', idAsistente)
    .maybeSingle();

  if (!data) return false;

  const estatus = nombreEstatus(data as unknown as InscripcionRow);
  return estatus === 'Activa' || estatus === 'Asistió';
}

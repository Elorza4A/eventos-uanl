'use server';

import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { calcularEstatusEvento } from '@/app/(equipo)/equipo/listado-eventos/utils';
import { obtenerEventoParaCancelacion } from '@/app/(equipo)/equipo/listado-eventos/data';
import { fechaHoraLocal, fechaLocalAISO } from '@/lib/fechas-evento';
import { getPerfil } from '@/lib/auth/perfil';
import type {
  ResultadoCancelarEvento,
  ResultadoCrearEvento,
} from '@/types/eventos';
import { esquemaEvento, type ValoresEvento } from '@/lib/validations/evento';
import { createClient } from '@/utils/supabase/server';

const CAMPOS_PROTEGIDOS = [
  'id_administrador',
  'id_estatus_evento',
  'fecha_creacion',
] as const;

function comoObjeto(valor: unknown): Record<string, unknown> | null {
  if (typeof valor !== 'object' || valor === null) return null;
  return valor as Record<string, unknown>;
}

/** El cliente nunca envía la dependencia; si lo hace, debe coincidir con el perfil. */
function dependenciaManipulada(
  entrada: unknown,
  idDependencia: number,
): boolean {
  const objeto = comoObjeto(entrada);
  if (!objeto) return false;

  if (CAMPOS_PROTEGIDOS.some((campo) => campo in objeto)) return true;
  if (!('id_dependencia' in objeto)) return false;

  const enviada = objeto.id_dependencia;
  const numero =
    typeof enviada === 'number'
      ? enviada
      : typeof enviada === 'string' && enviada.trim() !== ''
        ? Number(enviada)
        : NaN;

  return numero !== idDependencia;
}

function extraerIdEvento(valor: unknown): number | null {
  let candidato = valor;

  if (Array.isArray(candidato)) candidato = candidato[0];
  const objetoCandidato = comoObjeto(candidato);
  if (objetoCandidato && 'id_evento' in objetoCandidato) {
    candidato = objetoCandidato.id_evento;
  }

  if (typeof candidato === 'number' && Number.isSafeInteger(candidato)) {
    return candidato;
  }

  if (typeof candidato === 'string' && /^\d+$/.test(candidato.trim())) {
    const numero = Number(candidato.trim());
    return Number.isSafeInteger(numero) ? numero : null;
  }

  return null;
}

export async function crearEvento(
  input: ValoresEvento,
): Promise<ResultadoCrearEvento> {
  const perfil = await getPerfil();
  if (!perfil.user || perfil.equipo?.rol !== 'Organizador') {
    return { ok: false, error: 'No tienes permiso para crear eventos.' };
  }
  if (perfil.equipo.idDependencia === null) {
    return {
      ok: false,
      error: 'Tu cuenta no tiene una dependencia asignada. Contacta al administrador.',
    };
  }
  if (dependenciaManipulada(input, perfil.equipo.idDependencia)) {
    return { ok: false, error: 'Los datos protegidos del evento no se pueden enviar.' };
  }

  const resultado = esquemaEvento.safeParse(input);
  if (!resultado.success) {
    return {
      ok: false,
      error: resultado.error.issues[0]?.message ?? 'Revisa los datos del evento.',
    };
  }

  const datos = resultado.data;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.rpc('crear_evento_uanl', {
    p_nombre: datos.nombre_evento,
    p_descripcion: datos.descripcion_evento,
    p_fecha_inicio: fechaLocalAISO(
      fechaHoraLocal(datos.dia_evento, datos.hora_inicio),
    ),
    p_fecha_fin: fechaLocalAISO(
      fechaHoraLocal(datos.dia_evento, datos.hora_fin),
    ),
    p_direccion: datos.direccion_evento,
    p_imagen_url: datos.imagen_url === '' ? null : datos.imagen_url,
    p_cupo: datos.cupo_maximo,
  });

  if (error) return { ok: false, error: error.message };

  const idEvento = extraerIdEvento(data);
  if (idEvento === null) {
    return {
      ok: false,
      error: 'No se pudo obtener el identificador del evento creado.',
    };
  }

  revalidatePath('/equipo/listado-eventos');
  redirect(
    `/equipo/listado-eventos/${idEvento}/informacion-general?creado=1`,
  );
}

export async function cancelarEvento(
  idEvento: number,
): Promise<ResultadoCancelarEvento> {
  if (!Number.isSafeInteger(idEvento) || idEvento <= 0) {
    return { ok: false, error: 'El evento no es válido.' };
  }

  const perfil = await getPerfil();
  if (
    !perfil.user ||
    perfil.equipo?.rol !== 'Organizador' ||
    perfil.equipo.idDependencia === null ||
    perfil.equipo.idAdministrador === null
  ) {
    return { ok: false, error: 'No tienes permiso para cancelar este evento.' };
  }

  const sinPermiso: ResultadoCancelarEvento = {
    ok: false,
    error: 'No tienes permiso para cancelar este evento.',
  };

  const evento = await obtenerEventoParaCancelacion(idEvento, {
    esAdministrador: false,
    idDependencia: perfil.equipo.idDependencia,
  });
  if (!evento || evento.idAdministrador !== perfil.equipo.idAdministrador) {
    return sinPermiso;
  }

  const estatus = calcularEstatusEvento(
    evento.estatusGuardado,
    evento.fechaInicio,
    evento.fechaFin,
  );
  const inicio = evento.fechaInicio ? new Date(evento.fechaInicio) : null;
  const yaEmpezo =
    !inicio || Number.isNaN(inicio.getTime()) || inicio.getTime() <= Date.now();

  if (estatus !== 'Activo' || yaEmpezo) {
    return {
      ok: false,
      error: 'Este evento ya no se puede cancelar porque no está activo.',
    };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { error } = await supabase.rpc('cancelar_evento_uanl', {
    p_evento: idEvento,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath('/equipo/listado-eventos');
  revalidatePath(`/equipo/listado-eventos/${idEvento}/informacion-general`);

  return { ok: true };
}

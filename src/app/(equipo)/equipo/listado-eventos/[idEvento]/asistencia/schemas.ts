import { z } from 'zod';

import type { EstatusEvento } from '../../types';

/** Solo se captura asistencia mientras el evento está activo o en curso. */
export const ESTATUS_REGISTRO_ASISTENCIA: readonly EstatusEvento[] = [
  'Activo',
  'En curso',
];

export function estatusPermiteRegistroAsistencia(
  estatus: EstatusEvento,
): boolean {
  return ESTATUS_REGISTRO_ASISTENCIA.includes(estatus);
}

export const MENSAJE_ESTATUS_NO_PERMITIDO =
  'Solo se puede registrar asistencia en eventos activos o en curso.';

/** El código siempre se maneja normalizado: 8 alfanuméricos con guion al centro. */
export const esquemaPase = z
  .string()
  .regex(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/, 'Formato inválido. Ejemplo: 039A-213B');

export const esquemaCapturaPase = z.object({ pase: esquemaPase });

export function normalizarPase(valor: string): string {
  const alfanumericos = valor
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8);

  return alfanumericos.length > 4
    ? `${alfanumericos.slice(0, 4)}-${alfanumericos.slice(4)}`
    : alfanumericos;
}

const asistenteSchema = z.object({
  id_asistente: z.coerce.number().int(),
  nombre: z.string(),
  tipo: z.enum(['Interno', 'Externo']),
  facultad: z.string().nullable(),
});

const conFecha = z.object({
  resultado: z.enum(['registrada', 'ya_registrada']),
  asistente: asistenteSchema,
  fecha_asistencia: z.string().nullable(),
});

const sinFecha = z.object({
  resultado: z.enum(['no_inscrito', 'inscripcion_cancelada']),
  asistente: asistenteSchema,
});

const paseInvalido = z.object({ resultado: z.literal('pase_invalido') });

/** Validación de la respuesta de la RPC; no confiamos en el tipo asumido. */
export const resultadoAsistenciaSchema = z.discriminatedUnion('resultado', [
  conFecha,
  sinFecha,
  paseInvalido,
]);

export const asistenciaFilaSchema = z.object({
  id_asistencia: z.coerce.number().int(),
  id_asistente: z.coerce.number().int(),
  nombre_asistente: z.string(),
  tipo: z.enum(['Interno', 'Externo']),
  facultad: z.string().nullable(),
  fecha_asistencia: z.string().nullable(),
});

export const listaAsistenciaSchema = z.array(asistenciaFilaSchema);

/** Respuesta de `resumen_asistencia_evento_uanl`; `null` significa sin acceso. */
export const resumenAsistenciaSchema = z.object({
  cupo_maximo: z.coerce.number().int().nonnegative(),
  inscritos: z.coerce.number().int().nonnegative(),
  asistieron: z.coerce.number().int().nonnegative(),
  canceladas: z.coerce.number().int().nonnegative(),
});

export type Asistente = z.infer<typeof asistenteSchema>;
export type ResultadoAsistencia = z.infer<typeof resultadoAsistenciaSchema>;
export type AsistenciaFila = z.infer<typeof asistenciaFilaSchema>;
export type ResumenAsistencia = z.infer<typeof resumenAsistenciaSchema>;

export type RespuestaAsistencia =
  | { ok: true; data: ResultadoAsistencia }
  | { ok: false; error: string };

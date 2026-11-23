import { z } from 'zod';

import { fechaDesdeComponentes } from '@/lib/fechas-evento';

const FORMATO_DIA = /^\d{4}-\d{2}-\d{2}$/;
const FORMATO_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;
const CUPO_MAXIMO = 1000;

function esUrlHttps(valor: string): boolean {
  if (!/^https:\/\//i.test(valor)) return false;
  try {
    new URL(valor);
    return true;
  } catch {
    return false;
  }
}

/**
 * Esquema compartido: el navegador envía día/hora por separado y el servidor
 * reconstruye exactamente los mismos datetime de siempre antes de la RPC.
 */
export const esquemaEventoBase = z.object({
  nombre_evento: z
    .string()
    .trim()
    .min(1, 'El nombre del evento es obligatorio.')
    .max(180, 'El nombre del evento no puede superar 180 caracteres.'),
  descripcion_evento: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(2000, 'La descripción no puede superar 2000 caracteres.'),
  dia_evento: z
    .string()
    .regex(FORMATO_DIA, 'Ingresa el día del evento correctamente.'),
  hora_inicio: z
    .string()
    .regex(FORMATO_HORA, 'Ingresa la hora de inicio correctamente.'),
  hora_fin: z
    .string()
    .regex(FORMATO_HORA, 'Ingresa la hora de fin correctamente.'),
  direccion_evento: z
    .string()
    .trim()
    .min(1, 'La dirección es obligatoria.')
    .max(300, 'La dirección no puede superar 300 caracteres.'),
  imagen_url: z.string().trim().refine(
    (valor) => valor === '' || esUrlHttps(valor),
    'La URL de la imagen debe ser válida y comenzar con https://',
  ),
  cupo_maximo: z
    .string()
    .trim()
    .min(1, 'El cupo máximo es obligatorio.')
    .regex(
      /^\d+$/,
      'El cupo máximo debe ser un entero mayor o igual a 0.',
    )
    .transform((valor) => Number(valor))
    .refine(
      (valor) => valor <= CUPO_MAXIMO,
      `El cupo máximo no puede ser mayor a ${CUPO_MAXIMO}.`,
    ),
});

export const esquemaEvento = esquemaEventoBase.superRefine((datos, ctx) => {
  const inicio = fechaDesdeComponentes(datos.dia_evento, datos.hora_inicio);
  const fin = fechaDesdeComponentes(datos.dia_evento, datos.hora_fin);

  if (!inicio || inicio.getTime() <= Date.now()) {
    ctx.addIssue({
      code: 'custom',
      path: ['hora_inicio'],
      message: 'La fecha y hora de inicio no pueden estar en el pasado.',
    });
  }

  if (inicio && fin && fin.getTime() <= inicio.getTime()) {
    ctx.addIssue({
      code: 'custom',
      path: ['hora_fin'],
      message: 'La hora de fin debe ser posterior a la de inicio.',
    });
  }
});

/** Valores tal como los maneja TanStack Form (antes del transform). */
export type ValoresEvento = z.input<typeof esquemaEvento>;
/** Valores ya validados y normalizados que consume la Server Action. */
export type EventoValidado = z.output<typeof esquemaEvento>;

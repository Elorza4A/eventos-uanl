import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

/** Zona de negocio: todo lo que escriba el usuario se interpreta aquí. */
export const ZONA_EVENTOS = 'America/Monterrey';

const FORMATO_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

/** Compone el `datetime-local` que históricamente consumía la base de datos. */
export function fechaHoraLocal(dia: string, hora: string): string {
  return `${dia}T${hora}`;
}

/** Convierte un valor `datetime-local` de Monterrey a un instante real. */
export function fechaDesdeLocal(valor: string): Date | null {
  if (!FORMATO_LOCAL.test(valor)) return null;

  const fecha = fromZonedTime(valor, ZONA_EVENTOS);
  if (Number.isNaN(fecha.getTime())) return null;

  // Evita fechas inexistentes que date-fns ajustaría silenciosamente.
  if (formatInTimeZone(fecha, ZONA_EVENTOS, "yyyy-MM-dd'T'HH:mm") !== valor) {
    return null;
  }

  return fecha;
}

/** Igual que `fechaDesdeLocal`, pero partiendo de los tres campos del formulario. */
export function fechaDesdeComponentes(dia: string, hora: string): Date | null {
  return fechaDesdeLocal(fechaHoraLocal(dia, hora));
}

export function esFechaFutura(valor: string, ahora: Date = new Date()): boolean {
  const fecha = fechaDesdeLocal(valor);
  return fecha !== null && fecha.getTime() > ahora.getTime();
}

/** Único punto donde se produce el ISO con offset que consume la RPC. */
export function fechaLocalAISO(valor: string): string {
  const fecha = fechaDesdeLocal(valor);
  if (!fecha) throw new Error('La fecha y hora del evento no son válidas.');
  return fecha.toISOString();
}

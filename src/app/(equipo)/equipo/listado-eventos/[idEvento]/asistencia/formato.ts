import { ZONA_EVENTOS } from '@/lib/fechas-evento';

function fechaValida(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/** Fecha y hora con segundos, en la zona del evento. */
export function formatearFechaAsistencia(
  valor: string | null | undefined,
): string {
  const fecha = fechaValida(valor);
  if (!fecha) return '—';

  return new Intl.DateTimeFormat('es-MX', {
    timeZone: ZONA_EVENTOS,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  }).format(fecha);
}

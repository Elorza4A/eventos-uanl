import type { EstatusEvento } from './types';

function fechaValida(valor: string | null | undefined): Date | null {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? null : fecha;
}

/**
 * El estatus guardado no cambia con el tiempo: la fecha manda, excepto cuando
 * el evento fue cancelado explícitamente.
 */
export function calcularEstatusEvento(
  estatusGuardado: string | null | undefined,
  fechaInicio: string | null | undefined,
  fechaFin: string | null | undefined,
  ahora: Date = new Date(),
): EstatusEvento {
  if (normalizarTexto(estatusGuardado ?? '') === 'cancelado') return 'Cancelado';

  const fin = fechaValida(fechaFin);
  if (fin && ahora >= fin) return 'Finalizado';

  const inicio = fechaValida(fechaInicio);
  if (inicio && ahora >= inicio) return 'En curso';

  return 'Activo';
}

export function formatearFecha(valor: string | null): string {
  const fecha = fechaValida(valor);
  if (!fecha) return '—';

  return new Intl.DateTimeFormat('es-MX', {
    timeZone: 'America/Monterrey',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(fecha);
}

export function normalizarTexto(valor: string): string {
  return valor
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function textoOGuion(valor: string | null | undefined): string {
  return valor && valor.trim() !== '' ? valor : '—';
}

export function compararFechas(
  a: string | null,
  b: string | null,
): number {
  const fechaA = fechaValida(a)?.getTime() ?? 0;
  const fechaB = fechaValida(b)?.getTime() ?? 0;
  return fechaA - fechaB;
}

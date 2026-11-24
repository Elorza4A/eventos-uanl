import type { EventoDb } from '@/lib/eventos-db';

/**
 * Adaptadores de presentación para los componentes del inicio.
 * Los eventos siempre vienen de Supabase; aquí solo se dan formato y se
 * selecciona un degradado visual, sin guardar información de eventos.
 */

export type EventItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string | null;
  startDate: string;
  endDate?: string;
  location: string;
  modality: 'Presencial' | 'Virtual' | 'Híbrido';
  price: number;
  capacity: number;
  registered: number;
  featured?: boolean;
  addedAt: string;
  gradient: string;
};

const dateFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  month: 'short',
  timeZone: 'America/Monterrey',
});

const dayFormatter = new Intl.DateTimeFormat('es-MX', {
  day: 'numeric',
  timeZone: 'America/Monterrey',
});

const monthFormatter = new Intl.DateTimeFormat('es-MX', {
  month: 'long',
  timeZone: 'America/Monterrey',
});

const weekdayFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  timeZone: 'America/Monterrey',
});

const fullDateFormatter = new Intl.DateTimeFormat('es-MX', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'America/Monterrey',
});

const timeFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'America/Monterrey',
});

// Solo estilos visuales; se asignan por posición, no forman parte del dato.
const GRADIENTS = [
  'from-sky-500 via-blue-600 to-indigo-700',
  'from-violet-600 via-purple-600 to-fuchsia-600',
  'from-rose-500 via-pink-600 to-purple-700',
  'from-emerald-500 via-teal-600 to-cyan-700',
  'from-amber-500 via-orange-600 to-red-600',
] as const;

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function formatEventDate(isoDate: string) {
  return dateFormatter.format(new Date(isoDate)).replace(/\./g, '');
}

export function formatEventDay(isoDate: string) {
  return dayFormatter.format(new Date(isoDate));
}

export function formatEventMonth(isoDate: string) {
  return capitalize(monthFormatter.format(new Date(isoDate)));
}

export function formatEventWeekday(isoDate: string) {
  return capitalize(weekdayFormatter.format(new Date(isoDate)));
}

export function formatFullEventDate(isoDate: string) {
  return capitalize(fullDateFormatter.format(new Date(isoDate)));
}

export function formatEventTime(isoDate: string) {
  return timeFormatter.format(new Date(isoDate));
}

export function formatPrice(price: number) {
  return price === 0 ? 'Gratis' : `$${price.toLocaleString('es-MX')} MXN`;
}

export function getRemainingSpots(event: EventItem) {
  return Math.max(event.capacity - event.registered, 0);
}

export function getOccupancyPercent(event: EventItem) {
  if (event.capacity === 0) return 100;
  return Math.min(Math.round((event.registered / event.capacity) * 100), 100);
}

/** Convierte un evento real de Supabase al modelo que ya consumen las tarjetas. */
export function eventoDbAEventoItem(evento: EventoDb, indice = 0): EventItem {
  return {
    id: String(evento.id),
    title: evento.nombre,
    category: evento.dependencia ?? 'Evento UANL',
    description: evento.descripcion || 'Este evento aún no tiene una descripción registrada.',
    imageUrl: evento.imagenUrl,
    startDate: evento.fechaInicio,
    endDate: evento.fechaFin,
    location: evento.direccion || 'Ubicación por definir',
    modality: 'Presencial',
    price: 0,
    capacity: evento.cupoMaximo,
    registered: evento.inscritos,
    addedAt: evento.fechaCreacion,
    gradient: GRADIENTS[indice % GRADIENTS.length],
  };
}

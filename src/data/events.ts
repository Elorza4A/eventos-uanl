export type EventItem = {
  id: string;
  title: string;
  category: string;
  description: string;
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

export const events: EventItem[] = [
  {
    id: 'feria-ciencias',
    title: 'Feria de Ciencias e Innovación 2026',
    category: 'Tecnología',
    description:
      'Explora prototipos, proyectos de investigación y soluciones tecnológicas creadas por estudiantes de todas las facultades.',
    startDate: '2026-11-14T09:00:00-06:00',
    endDate: '2026-11-14T18:00:00-06:00',
    location: 'Centro de Innovación UANL',
    modality: 'Presencial',
    price: 0,
    capacity: 300,
    registered: 214,
    featured: true,
    addedAt: '2026-11-01T10:00:00-06:00',
    gradient: 'from-sky-500 via-blue-600 to-indigo-700',
  },
  {
    id: 'congreso-ia',
    title: 'Congreso de Inteligencia Artificial',
    category: 'Tecnología',
    description:
      'Conferencias magistrales y talleres prácticos sobre machine learning, ética algorítmica y aplicaciones reales de la IA.',
    startDate: '2026-11-20T10:00:00-06:00',
    endDate: '2026-11-21T17:00:00-06:00',
    location: 'Auditorio Principal',
    modality: 'Híbrido',
    price: 450,
    capacity: 180,
    registered: 171,
    featured: true,
    addedAt: '2026-10-28T12:00:00-06:00',
    gradient: 'from-violet-600 via-purple-600 to-fuchsia-600',
  },
  {
    id: 'noche-teatro',
    title: 'Noche de Teatro Universitario',
    category: 'Cultural',
    description:
      'Una selección de obras cortas dirigidas e interpretadas por el taller de teatro universitario. Entrada con cupo limitado.',
    startDate: '2026-11-22T19:30:00-06:00',
    endDate: '2026-11-22T22:00:00-06:00',
    location: 'Teatro Universitario',
    modality: 'Presencial',
    price: 120,
    capacity: 220,
    registered: 198,
    featured: true,
    addedAt: '2026-11-03T09:30:00-06:00',
    gradient: 'from-rose-500 via-pink-600 to-purple-700',
  },
  {
    id: 'torneo-futbol',
    title: 'Torneo Relámpago de Fútbol 7',
    category: 'Deportivo',
    description:
      'Competencia mixta de fútbol 7 con equipos de 10 integrantes. Incluye arbitraje, hidratación y premiación.',
    startDate: '2026-11-29T08:00:00-06:00',
    endDate: '2026-11-29T14:00:00-06:00',
    location: 'Unidad Deportiva Universitaria',
    modality: 'Presencial',
    price: 0,
    capacity: 120,
    registered: 116,
    featured: true,
    addedAt: '2026-10-31T15:00:00-06:00',
    gradient: 'from-emerald-500 via-teal-600 to-cyan-700',
  },
  {
    id: 'concierto-universitario',
    title: 'Concierto de Música Universitaria',
    category: 'Cultural',
    description:
      'Banda sinfónica, grupos estudiantiles y artistas invitados en una noche al aire libre. Trae tu manta y disfruta.',
    startDate: '2026-12-05T18:00:00-06:00',
    endDate: '2026-12-05T23:00:00-06:00',
    location: 'Explanada Central',
    modality: 'Presencial',
    price: 200,
    capacity: 500,
    registered: 342,
    featured: true,
    addedAt: '2026-10-25T11:00:00-06:00',
    gradient: 'from-amber-500 via-orange-600 to-red-600',
  },
  {
    id: 'taller-empleabilidad',
    title: 'Taller de Empleabilidad y CV',
    category: 'Académico',
    description:
      'Aprende a construir un CV competitivo, prepararte para entrevistas y potenciar tu perfil profesional.',
    startDate: '2026-11-12T16:00:00-06:00',
    endDate: '2026-11-12T19:00:00-06:00',
    location: 'Sala de Capacitación, Edificio B',
    modality: 'Presencial',
    price: 0,
    capacity: 60,
    registered: 41,
    addedAt: '2026-11-05T08:00:00-06:00',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'hackathon-uanl',
    title: 'Hackathon UANL 2026',
    category: 'Tecnología',
    description:
      '36 horas para crear soluciones tecnológicas a retos reales. Forma tu equipo, recibe mentoría y compite por premios.',
    startDate: '2026-12-11T08:00:00-06:00',
    endDate: '2026-12-12T20:00:00-06:00',
    location: 'Laboratorios de Ingeniería',
    modality: 'Presencial',
    price: 0,
    capacity: 150,
    registered: 139,
    addedAt: '2026-11-06T14:00:00-06:00',
    gradient: 'from-indigo-600 to-sky-500',
  },
  {
    id: 'expo-diseno',
    title: 'Expo de Diseño y Arte Digital',
    category: 'Cultural',
    description:
      'Muestra de ilustración, animación, fotografía y proyectos interactivos de la comunidad creativa universitaria.',
    startDate: '2026-11-26T12:00:00-06:00',
    endDate: '2026-11-27T19:00:00-06:00',
    location: 'Galería Universitaria',
    modality: 'Presencial',
    price: 0,
    capacity: 90,
    registered: 66,
    addedAt: '2026-11-04T10:00:00-06:00',
    gradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 'seminario-sustentabilidad',
    title: 'Seminario de Sustentabilidad',
    category: 'Académico',
    description:
      'Paneles y casos prácticos sobre gestión de residuos, movilidad sostenible y proyectos de impacto ambiental.',
    startDate: '2026-12-03T09:00:00-06:00',
    endDate: '2026-12-03T14:00:00-06:00',
    location: 'Auditorio B',
    modality: 'Híbrido',
    price: 0,
    capacity: 80,
    registered: 52,
    addedAt: '2026-10-30T09:00:00-06:00',
    gradient: 'from-lime-500 to-emerald-600',
  },
  {
    id: 'carrera-5k',
    title: 'Carrera 5K por la Salud',
    category: 'Deportivo',
    description:
      'Carrera recreativa por el circuito universitario. Incluye kit, medalla y actividades de bienestar al finalizar.',
    startDate: '2026-11-15T07:00:00-06:00',
    endDate: '2026-11-15T10:30:00-06:00',
    location: 'Circuito Universitario',
    modality: 'Presencial',
    price: 150,
    capacity: 200,
    registered: 196,
    addedAt: '2026-11-02T07:00:00-06:00',
    gradient: 'from-orange-500 to-amber-600',
  },
  {
    id: 'feria-empleo',
    title: 'Feria de Empleo y Prácticas',
    category: 'Académico',
    description:
      'Más de 40 empresas y organizaciones con vacantes, prácticas profesionales y programas de talento joven.',
    startDate: '2026-11-18T10:00:00-06:00',
    endDate: '2026-11-18T17:00:00-06:00',
    location: 'Polideportivo Universitario',
    modality: 'Presencial',
    price: 0,
    capacity: 400,
    registered: 287,
    addedAt: '2026-10-29T11:30:00-06:00',
    gradient: 'from-slate-600 to-gray-800',
  },
  {
    id: 'cine-club',
    title: 'Ciclo de Cine Club',
    category: 'Cultural',
    description:
      'Proyección y conversatorio en torno a cine latinoamericano contemporáneo. Palomitas incluidas.',
    startDate: '2026-12-09T17:00:00-06:00',
    endDate: '2026-12-09T20:00:00-06:00',
    location: 'Sala Audiovisual',
    modality: 'Presencial',
    price: 0,
    capacity: 70,
    registered: 63,
    addedAt: '2026-11-07T16:00:00-06:00',
    gradient: 'from-fuchsia-500 to-indigo-600',
  },
  {
    id: 'taller-fotografia',
    title: 'Taller de Fotografía Urbana',
    category: 'Cultural',
    description:
      'Recorrido práctico por el campus para trabajar composición, luz natural y narrativa visual. Trae tu cámara o celular.',
    startDate: '2026-11-24T16:30:00-06:00',
    endDate: '2026-11-24T19:30:00-06:00',
    location: 'Explanada de Rectoría',
    modality: 'Presencial',
    price: 0,
    capacity: 40,
    registered: 38,
    addedAt: '2026-11-08T09:00:00-06:00',
    gradient: 'from-teal-500 to-green-600',
  },
];

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

export function getFeaturedEvents() {
  return events.filter((event) => event.featured).slice(0, 5);
}

export function getUpcomingEvents(limit = 3) {
  return [...events]
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, limit);
}

export function getRecentlyAddedEvents(limit = 3) {
  return [...events]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, limit);
}

export function getLastSpotsEvents(limit = 3) {
  return events
    .filter((event) => getRemainingSpots(event) / event.capacity <= 0.2)
    .sort((a, b) => {
      const remainingDiff = getRemainingSpots(a) - getRemainingSpots(b);
      if (remainingDiff !== 0) return remainingDiff;
      return getRemainingSpots(a) / a.capacity - getRemainingSpots(b) / b.capacity;
    })
    .slice(0, limit);
}

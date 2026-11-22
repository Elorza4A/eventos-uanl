import EventCard from '@/components/events/EventCard';
import { getUpcomingEvents } from '@/data/events';
import { requireRole } from '@/lib/dal';

export default async function MisEventosPage() {
  const user = await requireRole(['asistente', 'admin'], '/login/asistente');
  const eventos = getUpcomingEvents(3);

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Área de asistentes
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Mis eventos</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Hola, {user.nombre || user.email}. Aquí encontrarás los próximos eventos
          disponibles para ti.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {eventos.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </section>
    </div>
  );
}

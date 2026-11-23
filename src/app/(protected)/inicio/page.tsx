import EventCard from '@/components/events/EventCard';
import { ASSISTANT_ROLES } from '@/config/permissions';
import { requireRole } from '@/lib/dal';
import { esEventoActivo, getEventosPublicos, ordenarPorPopularidad } from '@/lib/eventos-db';
import { eventoDbAEventoItem } from '@/lib/eventos-vista';

export const dynamic = 'force-dynamic';

export default async function InicioAsistentePage() {
  const user = await requireRole(ASSISTANT_ROLES, '/login');
  const { eventos } = await getEventosPublicos();
  const items = eventos
    .filter(esEventoActivo)
    .sort(ordenarPorPopularidad)
    .slice(0, 3)
    .map((evento, indice) => eventoDbAEventoItem(evento, indice));

  return (
    <div className="space-y-8">
      <header className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
          Inicio · Asistentes
        </p>
        <h1 className="mt-2 text-2xl font-bold text-gray-900">Hola, {user.nombre || user.email}</h1>
        <p className="mt-3 text-sm leading-relaxed text-gray-600">
          Este es tu espacio. Aquí encontrarás los próximos eventos disponibles
          para ti.
        </p>
      </header>

      {items.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </section>
      ) : (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Por ahora no hay eventos disponibles. Vuelve pronto para descubrir nuevas actividades.
        </p>
      )}
    </div>
  );
}

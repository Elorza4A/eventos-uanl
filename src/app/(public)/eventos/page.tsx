import type { Metadata } from 'next';
import EventoDbCard from '@/components/events/EventoDbCard';
import { getEventosPublicos } from '@/lib/eventos-db';

export const metadata: Metadata = {
  title: 'Eventos',
  description: 'Consulta los eventos publicados en la base de datos de Eventos UANL.',
};

// Los eventos se consultan en cada request directamente desde Supabase.
export const dynamic = 'force-dynamic';

export default async function EventosPage() {
  const { eventos, error } = await getEventosPublicos();

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)] uppercase">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
          Agenda universitaria
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-navy)] sm:text-4xl">
          Todos los eventos
        </h1>
      </header>

      {error ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800"
        >
          No fue posible cargar los eventos. Intenta nuevamente más tarde.
        </div>
      ) : eventos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {eventos.map((evento) => (
            <EventoDbCard key={evento.id} evento={evento} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-[var(--color-primary)]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-7 w-7"
            >
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M8 3v4M16 3v4M3 10h18" />
            </svg>
          </span>
          <h2 className="mt-5 text-xl font-bold text-[var(--color-navy)]">
            No hay eventos disponibles
          </h2>
          <p className="mt-2 max-w-md text-sm text-slate-600">
            En este momento no hay eventos publicados en la base de datos. Vuelve pronto para
            conocer la agenda universitaria.
          </p>
        </div>
      )}
    </div>
  );
}

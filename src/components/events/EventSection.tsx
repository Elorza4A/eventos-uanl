import Link from 'next/link';
import EventCard from './EventCard';
import type { EventItem } from '@/data/events';

type Accent = 'blue' | 'emerald' | 'rose';

type EventSectionProps = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  events: EventItem[];
  accent?: Accent;
};

const accentStyles: Record<Accent, { dot: string; link: string }> = {
  blue: {
    dot: 'bg-blue-600',
    link: 'text-blue-700 hover:text-blue-800',
  },
  emerald: {
    dot: 'bg-emerald-600',
    link: 'text-emerald-700 hover:text-emerald-800',
  },
  rose: {
    dot: 'bg-rose-600',
    link: 'text-rose-700 hover:text-rose-800',
  },
};

export default function EventSection({
  id,
  eyebrow,
  title,
  description,
  events,
  accent = 'blue',
}: EventSectionProps) {
  const styles = accentStyles[accent];

  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-slate-500 uppercase">
            <span className={`h-2 w-2 rounded-full ${styles.dot}`} aria-hidden="true" />
            {eyebrow}
          </p>
          <h2
            id={`${id}-title`}
            className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl"
          >
            {title}
          </h2>
          <p className="mt-1.5 max-w-2xl text-sm text-slate-600">{description}</p>
        </div>

        <Link
          href="/eventos"
          className={`group inline-flex shrink-0 items-center gap-1 text-sm font-semibold ${styles.link}`}
        >
          Ver todos
          <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </Link>
      </div>

      {events.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center text-sm text-slate-500">
          Por ahora no hay eventos en esta sección. Vuelve pronto para descubrir nuevas actividades.
        </p>
      )}
    </section>
  );
}

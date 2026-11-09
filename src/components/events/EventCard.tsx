import Link from 'next/link';
import {
  formatEventDay,
  formatEventMonth,
  formatEventTime,
  formatEventWeekday,
  formatPrice,
  getRemainingSpots,
  type EventItem,
} from '@/data/events';

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

export default function EventCard({ event }: { event: EventItem }) {
  const remaining = getRemainingSpots(event);
  const isSoldOut = remaining === 0;
  const isLowAvailability = remaining > 0 && remaining / event.capacity <= 0.2;

  const availabilityStyles = isSoldOut
    ? 'bg-slate-100 text-slate-600'
    : isLowAvailability
      ? 'bg-rose-50 text-rose-700'
      : 'bg-emerald-50 text-emerald-700';

  const availabilityLabel = isSoldOut
    ? 'Evento agotado'
    : isLowAvailability
      ? `Últimos ${remaining} cupos`
      : `${remaining} cupos disponibles`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition duration-300 focus-within:ring-2 focus-within:ring-blue-500/60 focus-within:ring-offset-2 hover:-translate-y-1 hover:shadow-lg">
      <div className={`relative h-32 bg-gradient-to-br ${event.gradient}`}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-2 p-4">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
            {event.category}
          </span>
          <span className="rounded-full bg-black/20 px-3 py-1 text-xs font-medium text-white">
            {event.modality}
          </span>
        </div>

        <div className="absolute -bottom-5 left-5 flex h-14 w-14 flex-col items-center justify-center rounded-xl bg-white shadow-md ring-1 ring-black/5">
          <span className="text-lg leading-none font-bold text-slate-900">
            {formatEventDay(event.startDate)}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-wide text-slate-500 uppercase">
            {formatEventMonth(event.startDate).slice(0, 3)}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 pt-8 pb-5">
        <p className="text-xs font-medium text-slate-500">
          {formatEventWeekday(event.startDate)} · {formatEventTime(event.startDate)} h
        </p>

        <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
          <Link href="/eventos" className="focus:outline-none">
            <span className="absolute inset-0" aria-hidden="true" />
            {event.title}
          </Link>
        </h3>

        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {event.description}
        </p>

        <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-500">
          <PinIcon />
          <span className="truncate">{event.location}</span>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-gray-100 pt-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${availabilityStyles}`}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {availabilityLabel}
          </span>
          <span className="shrink-0 text-sm font-bold text-slate-900">
            {formatPrice(event.price)}
          </span>
        </div>
      </div>
    </article>
  );
}

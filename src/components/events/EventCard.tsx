import Link from 'next/link';
import {
  formatEventDay,
  formatEventMonth,
  formatEventTime,
  formatEventWeekday,
  getRemainingSpots,
  type EventItem,
} from '@/data/events';

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 shrink-0"
    >
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M8 2.5v4M16 2.5v4M3 9h18" />
      <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" strokeWidth="2.4" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 shrink-0"
    >
      <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-5 w-5 shrink-0"
    >
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0M16 5.5a2.5 2.5 0 0 1 0 5M17 14.5a4.5 4.5 0 0 1 3.5 4.5" />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-6 w-6"
    >
      <path d="M6 4.5A1.5 1.5 0 0 1 7.5 3h9A1.5 1.5 0 0 1 18 4.5V21l-6-3.5L6 21V4.5Z" />
    </svg>
  );
}

function ModalityIcon({ modality }: { modality: EventItem['modality'] }) {
  if (modality === 'Virtual') {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="8.5" />
        <path d="M3.5 12h17M12 3.5c2.2 2.3 3.3 5.1 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.1-3.3-8.5S9.8 5.8 12 3.5Z" />
      </svg>
    );
  }

  return <UsersIcon />;
}

export default function EventCard({ event }: { event: EventItem }) {
  const remaining = getRemainingSpots(event);
  const isSoldOut = remaining === 0;
  const isLowAvailability = remaining > 0 && remaining / event.capacity <= 0.2;

  const availabilityStyles = isSoldOut
    ? 'text-slate-600'
    : isLowAvailability
      ? 'text-rose-700'
      : 'text-emerald-700';

  const availabilityLabel = isSoldOut
    ? 'Evento agotado'
    : isLowAvailability
      ? `Últimos ${remaining} cupos`
      : `${remaining} cupos disponibles`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[1.4rem] border border-gray-200 bg-white shadow-sm transition duration-300 focus-within:ring-2 focus-within:ring-blue-500/60 focus-within:ring-offset-2 hover:-translate-y-1 hover:shadow-lg">
      <div className={`relative h-56 bg-gradient-to-br ${event.gradient}`}>
        <div
          className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.28),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative flex h-11 items-center gap-3 bg-slate-950/75 px-3 text-white">
          <div className="flex h-full items-center border-r border-white/30 pr-3">
            <span className="text-lg font-semibold leading-none">
              {formatEventDay(event.startDate)}
            </span>
            <span className="ml-1.5 text-xs font-medium uppercase">
              {formatEventMonth(event.startDate).slice(0, 3)}
            </span>
          </div>
          <span className="truncate text-center text-[11px] font-medium">
            Universidad Autónoma de Nuevo León
          </span>
        </div>

        <div className="absolute inset-x-5 bottom-5 text-center text-white drop-shadow-md">
          <h3 className="line-clamp-2 text-base font-bold leading-tight sm:text-lg">
            <Link
              href="/eventos"
              className="rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              {event.title}
            </Link>
          </h3>
          <div className="mt-3 flex items-center justify-center gap-2 text-xs font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/80">
              <ModalityIcon modality={event.modality} />
            </span>
            <span>{event.modality}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-blue-700 px-3 py-1 text-xs font-medium text-white">
              {event.category}
            </span>
            <span className="rounded-full bg-fuchsia-500 px-3 py-1 text-xs font-medium text-white">
              {formatEventWeekday(event.startDate)}
            </span>
          </div>
          <span className="text-slate-900" aria-label="Guardar evento">
            <BookmarkIcon />
          </span>
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-slate-600">
          {event.description}
        </p>

        <div className="mt-4 grid grid-cols-1 gap-3 text-xs font-semibold text-slate-900 sm:grid-cols-2">
          <div className="flex items-center gap-2">
            <CalendarIcon />
            <span>{formatEventTime(event.startDate)} h</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <PinIcon />
            <span className="truncate">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 sm:col-span-2">
            <UsersIcon />
            <span className={availabilityStyles}>{availabilityLabel}</span>
          </div>
        </div>
      </div>
    </article>
  );
}

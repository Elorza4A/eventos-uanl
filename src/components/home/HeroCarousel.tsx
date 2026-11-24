'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  formatEventDay,
  formatEventMonth,
  formatEventTime,
  formatEventWeekday,
  getOccupancyPercent,
  getRemainingSpots,
  type EventItem,
} from '@/lib/eventos-vista';

const ROTATION_MS = 5000;

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      className="h-4 w-4 shrink-0"
    >
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M16 3v4M8 3v4M3 11h18" strokeLinecap="round" />
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
      className="h-4 w-4 shrink-0"
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
      className="h-4 w-4 shrink-0"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </svg>
  );
}

function ChevronIcon({ direction }: { direction: 'left' | 'right' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 ${direction === 'left' ? 'rotate-180' : ''}`}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function PauseIcon({ paused }: { paused: boolean }) {
  if (paused) {
    return (
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
        <path d="M8 5v14l11-7z" />
      </svg>
    );
  }

  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
      <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
    </svg>
  );
}

function HeroEventImage({
  imageUrl,
  gradient,
  priority,
}: {
  imageUrl: string | null;
  gradient: string;
  priority: boolean;
}) {
  const [fallo, setFallo] = useState(false);

  if (!imageUrl || fallo) {
    return (
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient}`}
        aria-hidden="true"
      />
    );
  }

  return (
    <Image
      src={imageUrl}
      alt=""
      fill
      unoptimized
      sizes="(max-width: 1024px) 100vw, 1152px"
      priority={priority}
      onError={() => setFallo(true)}
      className="object-cover"
      aria-hidden="true"
    />
  );
}

export default function HeroCarousel({ events }: { events: EventItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const total = events.length;

  useEffect(() => {
    if (isPaused || total < 2) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % total);
    }, ROTATION_MS);

    return () => window.clearInterval(timer);
  }, [isPaused, total]);

  if (total === 0) return null;

  const goTo = (index: number) => setActiveIndex((index + total) % total);

  return (
    <section aria-roledescription="carrusel" aria-label="Eventos destacados" className="relative">
      <div className="grid overflow-hidden rounded-3xl shadow-xl ring-1 ring-slate-900/10">
        {events.map((event, index) => {
          const isActive = index === activeIndex;
          const remaining = getRemainingSpots(event);
          const occupancy = getOccupancyPercent(event);

          return (
            <article
              key={event.id}
              aria-roledescription="diapositiva"
              aria-label={`${index + 1} de ${total}: ${event.title}`}
              inert={!isActive}
              className={`relative isolate col-start-1 row-start-1 h-[440px] overflow-hidden transition-opacity duration-700 ease-out sm:h-[520px] lg:h-[470px] ${
                isActive ? 'z-10 opacity-100' : 'z-0 opacity-0'
              }`}
            >
              <HeroEventImage
                imageUrl={event.imageUrl}
                gradient={event.gradient}
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-slate-950/30" aria-hidden="true" />
              <div
                className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.3),transparent_48%)]"
                aria-hidden="true"
              />
              <div
                className="absolute -right-20 -bottom-32 h-80 w-80 rounded-full bg-white/10 blur-2xl"
                aria-hidden="true"
              />

              <div className="relative flex h-full flex-col justify-center px-6 py-5 sm:grid sm:grid-cols-[1.25fr_1fr] sm:items-center sm:gap-6 sm:px-8 lg:grid-cols-[1.55fr_1fr] lg:gap-12 lg:px-12 lg:py-8">
                <div>
                  <div className="hidden flex-wrap items-center gap-2 sm:flex">
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold tracking-wider uppercase backdrop-blur">
                      {event.category}
                    </span>
                    <span className="rounded-full border border-white/30 px-3 py-1 text-xs font-medium text-white/90">
                      Evento destacado
                    </span>
                    {index === 0 ? (
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-navy)]">
                        Más inscritos
                      </span>
                    ) : null}
                  </div>

                  <h1 className="line-clamp-2 text-2xl leading-tight font-bold text-white sm:mt-4 sm:text-3xl lg:mt-5 lg:text-4xl">
                    {event.title}
                  </h1>

                  <p className="mt-3 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/85 sm:line-clamp-2 sm:text-base">
                    {event.description}
                  </p>

                  <div className="mt-3 flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 px-3 py-2 backdrop-blur-sm sm:hidden">
                    <span className="text-3xl leading-none font-bold text-white">
                      {formatEventDay(event.startDate)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {formatEventMonth(event.startDate)}
                      </p>
                      <p className="text-xs text-white/80">
                        {formatEventWeekday(event.startDate)} · {formatEventTime(event.startDate)} h
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 sm:hidden">
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>Cupos ocupados</span>
                      <span>{event.registered}/{event.capacity}</span>
                    </div>
                    <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white transition-[width] duration-500"
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                    <p className="mt-1.5 text-xs font-medium text-white/85">
                      {remaining} lugares disponibles
                    </p>
                  </div>

                  <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/90 lg:mt-5">
                    <div className="hidden items-center gap-2 sm:flex">
                      <CalendarIcon />
                      <span>
                        {formatEventDay(event.startDate)} de {formatEventMonth(event.startDate)} ·{' '}
                        {formatEventTime(event.startDate)} h
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <PinIcon />
                      <span>{event.location}</span>
                    </div>
                    <div className="hidden items-center gap-2 sm:flex">
                      <UsersIcon />
                      <span>
                        {event.registered} inscritos · {remaining} cupos disponibles
                      </span>
                    </div>
                  </dl>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Link
                      href={`/eventos/${event.id}`}
                      className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-900 shadow-sm transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 focus-visible:outline-none"
                    >
                      Ver detalles del evento
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>

                <div className="hidden w-full rounded-2xl border border-white/25 bg-white/10 p-4 backdrop-blur-md sm:block lg:p-6">
                  <p className="text-xs font-semibold tracking-wider text-white/70 uppercase">
                    Próxima cita
                  </p>
                  <div className="mt-2 flex items-end gap-3">
                    <span className="text-5xl leading-none font-bold text-white">
                      {formatEventDay(event.startDate)}
                    </span>
                    <div className="pb-1">
                      <p className="text-base font-semibold text-white">
                        {formatEventMonth(event.startDate)}
                      </p>
                      <p className="text-xs text-white/80">
                        {formatEventWeekday(event.startDate)} · {formatEventTime(event.startDate)} h
                      </p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-white/80">
                      <span>Cupos ocupados</span>
                      <span>
                        {event.registered}/{event.capacity}
                      </span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-white transition-[width] duration-500"
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs text-white/80">{remaining} lugares disponibles</p>
                  </div>

                  <Link
                    href={`/eventos/${event.id}`}
                    className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-slate-950/80 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-950 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
                  >
                    Reservar mi lugar
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2" aria-label="Seleccionar evento destacado">
          {events.map((event, index) => {
            const isActive = index === activeIndex;

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => goTo(index)}
                aria-label={`Ver ${event.title}`}
                aria-current={isActive ? 'true' : undefined}
                className={`h-2.5 rounded-full transition-all duration-300 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
                  isActive ? 'w-8 bg-blue-600' : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <span className="mr-1 text-xs font-medium text-slate-500 tabular-nums">
            {String(activeIndex + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>

          <button
            type="button"
            onClick={() => setIsPaused((paused) => !paused)}
            aria-label={isPaused ? 'Reanudar rotación automática' : 'Pausar rotación automática'}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <PauseIcon paused={isPaused} />
          </button>

          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="Evento anterior"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <ChevronIcon direction="left" />
          </button>

          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="Siguiente evento"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <ChevronIcon direction="right" />
          </button>
        </div>
      </div>
    </section>
  );
}

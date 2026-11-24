import Image from 'next/image';
import Link from 'next/link';
import type { EventoDb } from '@/lib/eventos-db';

const fechaFormatter = new Intl.DateTimeFormat('es-MX', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Monterrey',
});

const horaFormatter = new Intl.DateTimeFormat('es-MX', {
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'America/Monterrey',
});

function formatearFecha(iso: string) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? iso : fechaFormatter.format(fecha);
}

function formatearHora(iso: string) {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? '' : horaFormatter.format(fecha);
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

export default function EventoDbCard({
  evento,
  estatusInscripcion,
}: {
  evento: EventoDb;
  estatusInscripcion?: string;
}) {
  const horario = `${formatearHora(evento.fechaInicio)} – ${formatearHora(evento.fechaFin)} h`;

  return (
    <Link
      href={`/eventos/${evento.id}`}
      aria-label={`Ver detalles de ${evento.nombre}`}
      className="group block h-full rounded-[1.4rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
    >
    <article className="relative flex h-full min-w-0 flex-col overflow-hidden rounded-[1.4rem] border border-gray-200 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
      <div className="relative h-40 overflow-hidden bg-[var(--color-navy)] sm:h-44">
        {evento.imagenUrl ? (
          <Image
            src={evento.imagenUrl}
            alt={`Imagen del evento ${evento.nombre}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-primary)] to-[var(--color-accent)]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />

        <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--color-navy)] shadow-sm">
          {evento.estatus}
        </span>

        <div className="absolute inset-x-4 bottom-4 text-white">
          <p className="text-xs font-medium text-white/90">{formatearFecha(evento.fechaInicio)}</p>
          <h3 className="mt-1 line-clamp-2 text-base leading-tight font-bold sm:text-lg">
            {evento.nombre}
          </h3>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
        <p className="text-xs font-semibold text-[var(--color-primary)]">
          {evento.dependencia ?? 'Dependencia UANL'}
        </p>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-slate-600">
          {evento.descripcion || 'Este evento aún no tiene una descripción registrada.'}
        </p>

        <div className="mt-4 space-y-2 border-t border-gray-100 pt-4 text-xs font-medium text-slate-700">
          <p className="flex items-center gap-2">
            <PinIcon />
            <span className="truncate">{evento.direccion || 'Ubicación por definir'}</span>
          </p>
          <p className="text-slate-500">{horario}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-slate-700">
              {evento.inscritos} inscritos
            </span>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-slate-700">
              Cupo máximo: {evento.cupoMaximo}
            </span>
            <span
              className={`rounded-full px-2.5 py-1 ${
                evento.cupoDisponible > 0
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-rose-50 text-rose-700'
              }`}
            >
              {evento.cupoDisponible > 0
                ? `${evento.cupoDisponible} lugares libres`
                : 'Cupo lleno'}
            </span>
            {estatusInscripcion ? (
              <span className="rounded-full bg-[var(--color-primary)] px-2.5 py-1 text-white">
                Inscripción: {estatusInscripcion}
              </span>
            ) : null}
          </div>
        </div>
      </div>
    </article>
    </Link>
  );
}

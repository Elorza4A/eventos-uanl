import Link from 'next/link';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import InscribirseButton from '@/components/events/InscribirseButton';
import {
  getAsistenteActual,
  getEventoPublico,
  yaEstaInscrito,
} from '@/lib/eventos-db';

export const dynamic = 'force-dynamic';

const fechaFormatter = new Intl.DateTimeFormat('es-MX', {
  dateStyle: 'long',
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

type EventoPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EventoDetallePage({ params }: EventoPageProps) {
  const { id } = await params;
  const idEvento = Number(id);

  if (!Number.isInteger(idEvento) || idEvento <= 0) notFound();

  const { evento, error } = await getEventoPublico(idEvento);

  if (error) {
    return (
      <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
<<<<<<< Updated upstream
        No fue posible cargar la información del evento. Intenta nuevamente más tarde.
=======
        No fue posible cargar la información del evento. Intenta nuevamente mas tarde.
>>>>>>> Stashed changes
      </div>
    );
  }

  if (!evento) notFound();

  const asistente = await getAsistenteActual();
  const inscrito = await yaEstaInscrito(evento.id, asistente?.id ?? null);
  const disponible = evento.estatus === 'Activo';

  const parrafos = evento.descripcion.split(/\n{2,}/).filter(Boolean);
  const horario = `${formatearHora(evento.fechaInicio)} – ${formatearHora(evento.fechaFin)} h`;

  return (
    <div className="space-y-8">
      <Link
        href="/eventos"
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-primary)] hover:underline focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
      >
        <span aria-hidden="true">←</span>
        Volver a eventos
      </Link>

      <div className="relative h-56 overflow-hidden rounded-2xl bg-[var(--color-navy)] shadow-sm sm:h-72 lg:h-96">
        {evento.imagenUrl ? (
          <Image
            src={evento.imagenUrl}
            alt={`Imagen del evento ${evento.nombre}`}
            fill
            unoptimized
            sizes="100vw"
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--color-navy)] via-[var(--color-primary)] to-[var(--color-accent)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
        <div className="absolute inset-x-5 bottom-5 text-white sm:inset-x-8 sm:bottom-8">
          <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[var(--color-navy)]">
            {evento.estatus}
          </span>
          <h1 className="mt-3 text-2xl leading-tight font-extrabold sm:text-3xl lg:text-4xl">
            {evento.nombre}
          </h1>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <section>
            <p className="text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)] uppercase">
              {evento.dependencia ?? 'Dependencia UANL'}
            </p>
            <h2 className="mt-2 text-xl font-bold text-[var(--color-navy)] sm:text-2xl">
              Acerca del evento
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600 sm:text-base">
              {parrafos.length > 0 ? (
                parrafos.map((parrafo, index) => <p key={index}>{parrafo}</p>)
              ) : (
                <p>Este evento aún no tiene una descripción registrada.</p>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold text-[var(--color-navy)]">Información general</h2>
            <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="font-semibold text-slate-500">Fecha</dt>
                <dd className="mt-1 text-slate-800">{formatearFecha(evento.fechaInicio)}</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Horario</dt>
                <dd className="mt-1 text-slate-800">{horario}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="font-semibold text-slate-500">Ubicación</dt>
                <dd className="mt-1 text-slate-800">
                  {evento.direccion || 'Ubicación por definir'}
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Cupo máximo</dt>
                <dd className="mt-1 text-slate-800">{evento.cupoMaximo} personas</dd>
              </div>
              <div>
                <dt className="font-semibold text-slate-500">Estatus</dt>
                <dd className="mt-1 text-slate-800">{evento.estatus}</dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-[var(--color-navy)]">Registro al evento</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Al inscribirte, tu lugar queda guardado en la base de datos y aparecerá en «Mis
            eventos».
          </p>
          <div className="mt-5">
            <InscribirseButton
              idEvento={evento.id}
              yaInscrito={inscrito}
              disponible={disponible}
            />
          </div>
          {asistente ? (
            <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-slate-500">
              Pase de {asistente.nombre}: <strong className="text-slate-800">{asistente.pase}</strong>
            </p>
          ) : (
            <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-slate-500">
              Necesitas una cuenta de alumno para poder inscribirte.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

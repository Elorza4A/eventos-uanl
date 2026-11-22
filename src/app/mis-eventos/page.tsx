import type { Metadata } from 'next';
import Link from 'next/link';
import EventoDbCard from '@/components/events/EventoDbCard';
import {
  getAsistenteActual,
  getEventosPublicos,
  getInscripcionesDeAsistente,
} from '@/lib/eventos-db';

export const metadata: Metadata = {
  title: 'Mis eventos',
  description: 'Eventos en los que estás inscrito y datos de tu pase de alumno.',
};

export const dynamic = 'force-dynamic';

function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: {
  titulo: string;
  descripcion: string;
  accion?: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <h2 className="text-xl font-bold text-[var(--color-navy)]">{titulo}</h2>
      <p className="mt-2 max-w-md text-sm text-slate-600">{descripcion}</p>
      {accion ? (
        <Link
          href="/eventos"
          className="mt-7 inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:brightness-110"
        >
          Explorar eventos
        </Link>
      ) : null}
    </div>
  );
}

export default async function MisEventosPage() {
  const asistente = await getAsistenteActual();

  if (!asistente) {
    return (
      <div className="space-y-8">
        <header className="max-w-2xl">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)] uppercase">
            <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
            Tu agenda personal
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-navy)] sm:text-4xl">
            Mis eventos
          </h1>
        </header>
        <EstadoVacio
          titulo="Inicia sesión para ver tus eventos"
          descripcion="Necesitas una cuenta de alumno para consultar los eventos en los que estás inscrito y tu código de pase."
        />
      </div>
    );
  }

  const inscripciones = await getInscripcionesDeAsistente(asistente.id);
  const { eventos } = await getEventosPublicos();
  const eventosPorId = new Map(eventos.map((evento) => [evento.id, evento]));
  const misEventos = inscripciones
    .map((inscripcion) => ({
      inscripcion,
      evento: eventosPorId.get(inscripcion.idEvento),
    }))
    .filter((item) => item.evento !== undefined);

  return (
    <div className="space-y-8">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)] uppercase">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
          Tu agenda personal
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-navy)] sm:text-4xl">
          Mis eventos
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Eventos en los que tienes un lugar guardado y datos de tu pase para confirmar la
          asistencia.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="text-lg font-bold text-[var(--color-navy)]">Datos del alumno</h2>
        <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3">
          <div>
            <dt className="font-semibold text-slate-500">Nombre</dt>
            <dd className="mt-1 break-words text-slate-800">{asistente.nombre}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Correo</dt>
            <dd className="mt-1 break-all text-slate-800">{asistente.correo}</dd>
          </div>
          <div>
            <dt className="font-semibold text-slate-500">Pase</dt>
            <dd className="mt-1 font-mono text-base font-bold tracking-wider text-[var(--color-primary)]">
              {asistente.pase}
            </dd>
          </div>
        </dl>
        <p className="mt-4 border-t border-gray-100 pt-4 text-xs text-slate-500">
          Presenta este código al ingresar al evento para que el organizador registre tu
          asistencia.
        </p>
      </section>

      {misEventos.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {misEventos.map(({ evento, inscripcion }) =>
            evento ? (
              <EventoDbCard
                key={inscripcion.idEvento}
                evento={evento}
                estatusInscripcion={inscripcion.estatus}
              />
            ) : null,
          )}
        </div>
      ) : (
        <EstadoVacio
          titulo="Aún no tienes eventos inscritos"
          descripcion="Cuando te inscribas a un evento, aparecerá aquí junto al estatus de tu inscripción."
          accion
        />
      )}
    </div>
  );
}

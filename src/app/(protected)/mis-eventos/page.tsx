import type { Metadata } from 'next';
import Link from 'next/link';

import CancelarInscripcionButton from '@/components/events/CancelarInscripcionButton';
import CodigoQrAlumno from '@/components/events/CodigoQrAlumno';
import EventoDbCard from '@/components/events/EventoDbCard';
import InscribirseButton from '@/components/events/InscribirseButton';
import {
  esEventoActivo,
  getAsistenteActual,
  getEventosPublicos,
  getInscripcionesDeAsistente,
  ordenarPorPopularidad,
  type AsistenteActual,
  type EventoDb,
  type InscripcionDb,
} from '@/lib/eventos-db';

export const metadata: Metadata = {
  title: 'Mis eventos',
  description: 'Eventos inscritos, pase de alumno y código QR para confirmar asistencia.',
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

/** Contenido del QR: datos del alumno + inscripción para validar la asistencia. */
function construirQr(
  asistente: AsistenteActual,
  inscripcion: InscripcionDb,
  evento: EventoDb,
) {
  return JSON.stringify({
    tipo: 'pase-asistencia-uanl',
    id_inscripcion: inscripcion.idInscripcion,
    id_evento: evento.id,
    nombre_evento: evento.nombre,
    id_pase: asistente.pase,
    nombre: asistente.nombre,
    correo: asistente.correo,
  });
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
          descripcion="Necesitas una cuenta de alumno para ver tus inscripciones y generar tu código QR de asistencia."
        />
      </div>
    );
  }

  const inscripciones = await getInscripcionesDeAsistente(asistente.id);
  const { eventos } = await getEventosPublicos();
  const eventosPorId = new Map(eventos.map((evento) => [evento.id, evento]));

  // Solo inscripciones vigentes: las canceladas ya no forman parte de "Mis inscripciones".
  const inscripcionesVigentes = inscripciones.filter(
    (inscripcion) => inscripcion.estatus === 'Activa' || inscripcion.estatus === 'Asistió',
  );
  const idsInscritos = new Set(inscripcionesVigentes.map((inscripcion) => inscripcion.idEvento));

  const misInscripciones = inscripcionesVigentes
    .map((inscripcion) => ({
      inscripcion,
      evento: eventosPorId.get(inscripcion.idEvento),
    }))
    .filter((item): item is { inscripcion: InscripcionDb; evento: EventoDb } => !!item.evento)
    .sort((a, b) => ordenarPorPopularidad(a.evento, b.evento));

  const eventosDisponibles = eventos
    .filter(
      (evento) =>
        esEventoActivo(evento) && evento.cupoDisponible > 0 && !idsInscritos.has(evento.id),
    )
    .sort(ordenarPorPopularidad);

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-[var(--color-primary)] uppercase">
          <span className="h-2 w-2 rounded-full bg-[var(--color-accent)]" aria-hidden="true" />
          Tu agenda personal
        </p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--color-navy)] sm:text-4xl">
          Mis eventos
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
          Consulta tus inscripciones, muestra tu código QR al llegar y administra tus lugares desde
          aquí.
        </p>
      </header>

      <section aria-labelledby="mis-inscripciones-title" className="space-y-5">
        <div>
          <h2 id="mis-inscripciones-title" className="text-xl font-bold text-[var(--color-navy)]">
            Mis inscripciones
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Tus eventos registrados, ordenados por popularidad. Muestra el QR al ingresar.
          </p>
        </div>

        {misInscripciones.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {misInscripciones.map(({ evento, inscripcion }) => (
              <div key={inscripcion.idInscripcion} className="flex flex-col gap-3">
                <EventoDbCard evento={evento} estatusInscripcion={inscripcion.estatus} />

                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <CodigoQrAlumno
                      valor={construirQr(asistente, inscripcion, evento)}
                      tamano={124}
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold tracking-wide text-[var(--color-primary)] uppercase">
                        Pase de asistencia
                      </p>
                      <p className="mt-1 font-mono text-base font-bold tracking-wider text-[var(--color-navy)]">
                        {asistente.pase}
                      </p>
                      <p className="mt-1 truncate text-sm text-slate-700">{asistente.nombre}</p>
                      <p className="mt-1 break-all text-xs text-slate-500">{asistente.correo}</p>
                      <p className="mt-2 text-xs leading-relaxed text-slate-500">
                        Presenta este QR al ingresar a {evento.nombre} para registrar tu
                        asistencia.
                      </p>
                    </div>
                  </div>
                </div>

                {inscripcion.estatus === 'Activa' ? (
                  <CancelarInscripcionButton
                    idEvento={evento.id}
                    nombreEvento={evento.nombre}
                  />
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <EstadoVacio
            titulo="Aún no tienes eventos inscritos"
            descripcion="Agrega un evento desde la sección siguiente y aparecerá aquí con su código QR."
            accion
          />
        )}
      </section>

      <section aria-labelledby="eventos-disponibles-title" className="space-y-5">
        <div>
          <h2
            id="eventos-disponibles-title"
            className="text-xl font-bold text-[var(--color-navy)]"
          >
            Eventos disponibles para inscribirte
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Eventos activos con lugares libres, ordenados por popularidad.
          </p>
        </div>

        {eventosDisponibles.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {eventosDisponibles.map((evento) => (
              <div key={evento.id} className="flex flex-col gap-3">
                <EventoDbCard evento={evento} />
                <InscribirseButton
                  idEvento={evento.id}
                  yaInscrito={false}
                  disponible
                  label="Agregar a mis eventos"
                  mensajeExito="Evento agregado a Mis eventos. Ya puedes mostrar tu QR."
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No hay eventos activos con cupos disponibles en este momento.
            </p>
          </div>
        )}
      </section>

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
      </section>
    </div>
  );
}

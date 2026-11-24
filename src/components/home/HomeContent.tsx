import EventSection from '@/components/events/EventSection';
import HeroCarousel from '@/components/home/HeroCarousel';
import {
  esEventoActivo,
  esEventoVigente,
  getEventosPublicos,
  ordenarPorPopularidad,
  type EventoDb,
} from '@/lib/eventos-db';
import { eventoDbAEventoItem } from '@/lib/eventos-vista';

function aItems(eventos: EventoDb[]) {
  return eventos.map((evento, indice) => eventoDbAEventoItem(evento, indice));
}

function porFechaInicio(a: EventoDb, b: EventoDb) {
  return new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime();
}

/** Inicio idéntico para visitantes y asistentes: mismo banner y mismas secciones. */
export default async function HomeContent() {
  const { eventos, error } = await getEventosPublicos();

  const vigentes = eventos.filter(esEventoVigente);
  // El banner destaca los 4 eventos vigentes con más asistentes inscritos.
  const masInscritos = [...vigentes].sort(ordenarPorPopularidad);
  const proximos = [...vigentes].sort(porFechaInicio);
  const novedades = [...eventos].sort(
    (a, b) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime(),
  );
  const ultimosCupos = eventos
    .filter((evento) => esEventoActivo(evento) && evento.cupoDisponible > 0)
    .sort((a, b) => {
      const proporcionA = a.cupoMaximo > 0 ? a.cupoDisponible / a.cupoMaximo : 0;
      const proporcionB = b.cupoMaximo > 0 ? b.cupoDisponible / b.cupoMaximo : 0;
      return proporcionA - proporcionB || b.inscritos - a.inscritos;
    });

  return (
    <div className="space-y-14 pb-4">
      {error ? (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800"
        >
          No fue posible cargar los eventos de la base de datos. Intenta nuevamente más tarde.
        </p>
      ) : null}

      <HeroCarousel events={aItems(masInscritos.slice(0, 4))} />

      <EventSection
        id="proximos-eventos"
        eyebrow="Agenda"
        title="Próximos eventos"
        description="Las actividades que están por comenzar. Reserva tu lugar y no te pierdas nada de la agenda universitaria."
        events={aItems(proximos.slice(0, 3))}
        accent="blue"
      />

      <EventSection
        id="eventos-anadidos"
        eyebrow="Novedades"
        title="Eventos añadidos"
        description="Recién publicados por la comunidad universitaria: talleres, conciertos, competencias y más."
        events={aItems(novedades.slice(0, 3))}
        accent="emerald"
      />

      <EventSection
        id="ultimos-cupos"
        eyebrow="No te quedes fuera"
        title="Últimos cupos"
        description="Eventos con disponibilidad limitada. Si te interesan, asegura tu lugar antes de que se agoten."
        events={aItems(ultimosCupos.slice(0, 3))}
        accent="rose"
      />
    </div>
  );
}

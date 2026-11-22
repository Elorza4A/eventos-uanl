import EventSection from '@/components/events/EventSection';
import HeroCarousel from '@/components/home/HeroCarousel';
import {
  getFeaturedEvents,
  getLastSpotsEvents,
  getRecentlyAddedEvents,
  getUpcomingEvents,
} from '@/data/events';

export default function HomePage() {
  return (
    <div className="space-y-14 pb-4">
      <HeroCarousel events={getFeaturedEvents()} />

      <EventSection
        id="proximos-eventos"
        eyebrow="Agenda"
        title="Próximos eventos"
        description="Las actividades que están por comenzar. Reserva tu lugar y no te pierdas nada de la agenda universitaria."
        events={getUpcomingEvents(3)}
        accent="blue"
      />

      <EventSection
        id="eventos-anadidos"
        eyebrow="Novedades"
        title="Eventos añadidos"
        description="Recién publicados por la comunidad universitaria: talleres, conciertos, competencias y más."
        events={getRecentlyAddedEvents(3)}
        accent="emerald"
      />

      <EventSection
        id="ultimos-cupos"
        eyebrow="No te quedes fuera"
        title="Últimos cupos"
        description="Eventos con disponibilidad limitada. Si te interesan, asegura tu lugar antes de que se agoten."
        events={getLastSpotsEvents(3)}
        accent="rose"
      />
    </div>
  );
}

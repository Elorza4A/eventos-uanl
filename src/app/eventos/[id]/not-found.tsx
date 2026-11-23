import Link from 'next/link';

export default function EventoNotFound() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
      <h1 className="text-2xl font-extrabold text-[var(--color-navy)]">Evento no encontrado</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        El evento que buscas no existe o ya no está publicado en la base de datos.
      </p>
      <Link
        href="/eventos"
        className="mt-7 inline-flex items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3 font-semibold text-white transition-colors hover:brightness-110"
      >
        Ver todos los eventos
      </Link>
    </div>
  );
}

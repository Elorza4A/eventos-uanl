import type { Metadata } from 'next';
import Link from 'next/link';

import Footer from '@/components/layout/Footer';
import NavBarServer from '@/components/layout/NavBarServer';

export const metadata: Metadata = {
  title: 'Página no encontrada | EventosUANL',
  description: 'La página que buscas no existe o fue movida.',
};

export default function NotFound() {
  return (
    <>
      <NavBarServer />
      <main className="mx-auto flex w-full max-w-6xl flex-1 items-center p-6">
        <section className="w-full rounded-xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <p className="text-sm font-bold uppercase tracking-widest text-[var(--color-primary)]">
            Error 404
          </p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            Página no encontrada
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-gray-600">
            La página que buscas no existe o fue movida. Puedes volver al inicio o
            explorar el catálogo de eventos.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/"
              className="rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]"
            >
              Ir al inicio
            </Link>
            <Link
              href="/eventos"
              className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
            >
              Ver eventos
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { segmento: 'informacion-general', etiqueta: 'Información general' },
  { segmento: 'asistencia', etiqueta: 'Asistencia' },
] as const;

export default function EventTabs({ idEvento }: { idEvento: string }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secciones del evento"
      className="flex gap-1 overflow-x-auto border-b border-gray-200"
    >
      {TABS.map((tab) => {
        const href = `/equipo/listado-eventos/${idEvento}/${tab.segmento}`;
        const activo = pathname.startsWith(href);

        return (
          <Link
            key={tab.segmento}
            href={href}
            aria-current={activo ? 'page' : undefined}
            className={`shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              activo
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

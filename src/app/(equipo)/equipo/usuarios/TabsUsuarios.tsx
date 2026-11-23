import Link from 'next/link';

type Props = {
  activo: 'administrador' | 'organizador';
};

const TABS = [
  {
    id: 'administrador',
    etiqueta: 'Administradores',
    href: '/equipo/usuarios/administrador',
  },
  {
    id: 'organizador',
    etiqueta: 'Organizadores',
    href: '/equipo/usuarios/organizador',
  },
] as const;

/** Pestañas resueltas en servidor desde el layout anidado correspondiente. */
export default function TabsUsuarios({ activo }: Props) {
  return (
    <nav
      aria-label="Listados de usuarios"
      className="flex flex-wrap gap-2 border-b border-gray-200"
    >
      {TABS.map((tab) => {
        const seleccionada = tab.id === activo;
        return (
          <Link
            key={tab.id}
            href={tab.href}
            aria-current={seleccionada ? 'page' : undefined}
            className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition ${
              seleccionada
                ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {tab.etiqueta}
          </Link>
        );
      })}
    </nav>
  );
}

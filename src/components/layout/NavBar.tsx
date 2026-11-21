'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Mis eventos', href: '/mis-eventos' },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[var(--color-navy)] shadow-sm">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center gap-6 px-4">
        <div className="flex shrink-0 items-center gap-3">
          <img src="/images/logo-uanl.png" alt="Logo de la UANL" className="h-10 w-10" />
          <Link href="/" className="text-xl font-bold text-white">
            EventosUANL
          </Link>
        </div>

        <nav className="flex flex-1 items-center gap-5" aria-label="Navegación principal">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`border-b-2 py-1 text-sm font-medium transition-colors ${
                  isActive
                    ? 'border-[var(--color-accent)] text-white'
                    : 'border-transparent text-white/85 hover:border-white/70 hover:text-white'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="shrink-0 border-l border-white/30 pl-5 text-sm text-white">
          <span className="block text-xs text-white/70">Sesión iniciada</span>
          <span className="font-medium">Nombre del usuario</span>
        </div>
      </div>
    </header>
  );
}
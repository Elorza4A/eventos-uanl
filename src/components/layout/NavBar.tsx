'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Eventos', href: '/eventos' },
    { name: 'Mis eventos', href: '/mis-eventos' },
  ];

  function linkClass(href: string) {
    const isActive = pathname === href;
    return `border-b-2 py-1 text-sm font-medium transition-colors ${
      isActive
        ? 'border-[var(--color-accent)] text-white'
        : 'border-transparent text-white/85 hover:border-white/70 hover:text-white'
    }`;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[var(--color-navy)] shadow-sm">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
        <div className="flex shrink-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo-uanl.png" alt="Logo de la UANL" className="h-10 w-10" />
          <Link href="/" className="text-xl font-bold text-white">
            EventosUANL
          </Link>
        </div>

        <nav className="hidden flex-1 items-center gap-5 sm:flex" aria-label="Navegación principal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={linkClass(link.href)}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="hidden shrink-0 border-l border-white/30 pl-5 text-sm text-white md:block">
          <span className="block text-xs text-white/70">Sesión iniciada</span>
          <span className="font-medium">Nombre del usuario</span>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((abierto) => !abierto)}
          aria-expanded={menuOpen}
          aria-controls="menu-movil"
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-lg text-white hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none sm:hidden"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-6 w-6"
          >
            {menuOpen ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <nav
          id="menu-movil"
          aria-label="Navegación móvil"
          className="border-t border-white/15 bg-[var(--color-navy)] px-4 py-3 sm:hidden"
        >
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`block rounded-lg px-3 py-2 text-sm font-medium ${
                  pathname === link.href ? 'bg-white/10 text-white' : 'text-white/85'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="mt-3 border-t border-white/20 pt-3 text-sm text-white/90 md:hidden">
            <span className="block text-xs text-white/70">Sesión iniciada</span>
            <span className="font-medium">Nombre del usuario</span>
          </div>
        </nav>
      ) : null}
    </header>
  );
}

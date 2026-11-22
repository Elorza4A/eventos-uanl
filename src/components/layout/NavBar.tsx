'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { logout } from '@/app/actions/auth';
import type { NavLink } from '@/config/permissions';

type Props = {
  links: readonly NavLink[];
  user: { nombre: string; rolLabel: string } | null;
};

export default function Navbar({ links, user }: Props) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[var(--color-navy)] shadow-sm">
      <div className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2">
        <div className="flex shrink-0 items-center gap-3">
          <Image
            src="/images/logo-uanl.png"
            alt="Logo de la UANL"
            width={40}
            height={40}
            className="h-10 w-10"
          />
          <Link href="/" className="text-xl font-bold text-white">
            EventosUANL
          </Link>
        </div>

        <nav className="flex flex-1 flex-wrap items-center gap-5" aria-label="Navegación principal">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`border-b-2 py-1 text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? 'border-[var(--color-accent)] text-white'
                  : 'border-transparent text-white/85 hover:border-white/70 hover:text-white'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4 border-l border-white/30 pl-5 text-sm text-white">
          {user ? (
            <>
              <div className="text-right">
                <span className="block text-xs text-white/70">
                  Sesión iniciada · {user.rolLabel}
                </span>
                <span className="block max-w-48 truncate font-medium">{user.nombre}</span>
              </div>
              <form action={logout}>
                <button
                  type="submit"
                  className="rounded-md border border-white/40 px-3 py-1.5 text-xs font-medium text-white transition hover:border-white hover:bg-white/10"
                >
                  Cerrar sesión
                </button>
              </form>
            </>
          ) : (
            <div className="flex items-center gap-3 text-xs font-medium">
              <Link href="/login" className="text-white hover:underline">
                Acceso asistentes
              </Link>
              <span className="text-white/40" aria-hidden="true">|</span>
              <Link href="/equipo/login" className="text-white hover:underline">
                Acceso equipo
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

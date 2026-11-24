'use client';

import { logout } from '@/app/actions/auth';
import { ROLE_LABELS, type Role } from '@/config/permissions';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type Props = {
  rol: Role;
  nombre: string;
  email: string;
};

const itemClassName =
  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition';
const activeClassName = 'bg-white/15 text-white';
const idleClassName = 'text-white/70 hover:bg-white/10 hover:text-white';

export default function TeamSidebar({ rol, nombre, email }: Props) {
  const pathname = usePathname();
  const [usuariosOpen, setUsuariosOpen] = useState(
    pathname.startsWith('/equipo/usuarios'),
  );

  const isActive = (href: string) =>
    href === '/equipo'
      ? pathname === '/equipo' || pathname === '/equipo/inicio'
      : pathname === href || pathname.startsWith(`${href}/`);

  const linkClass = (href: string) =>
    `${itemClassName} ${isActive(href) ? activeClassName : idleClassName}`;

  return (
    <aside className="sticky top-0 flex min-h-screen w-64 shrink-0 flex-col bg-[var(--color-navy)] text-white">
      <div className="border-b border-white/15 px-6 py-5">
        <p className="text-xs font-bold uppercase tracking-widest text-white/60">
          EventosUANL
        </p>
        <p className="mt-1 text-lg font-semibold">Panel de equipo</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5" aria-label="Navegación de equipo">
        <Link href="/equipo" className={linkClass('/equipo')}>
          Inicio
        </Link>

        <Link
          href="/equipo/listado-eventos"
          className={linkClass('/equipo/listado-eventos')}
        >
          Eventos
        </Link>

        {rol === 'admin' ? (
          <div>
            <button
              type="button"
              onClick={() => setUsuariosOpen((open) => !open)}
              aria-expanded={usuariosOpen}
              className={`${itemClassName} w-full justify-between ${isActive('/equipo/usuarios') ? activeClassName : idleClassName}`}
            >
              Usuarios
              <span aria-hidden="true">{usuariosOpen ? '−' : '+'}</span>
            </button>

            {usuariosOpen ? (
              <div className="ml-3 mt-1 space-y-1 border-l border-white/20 pl-3">
                <Link
                  href="/equipo/usuarios/administrador"
                  className={linkClass('/equipo/usuarios/administrador')}
                >
                  Administrador
                </Link>
                <Link
                  href="/equipo/usuarios/organizador"
                  className={linkClass('/equipo/usuarios/organizador')}
                >
                  Organizador
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}
      </nav>

      <div className="border-t border-white/15 px-6 py-5">
        <p className="truncate text-sm font-medium">{nombre}</p>
        <p className="truncate text-xs text-white/60">{email}</p>
        <p className="mt-1 text-xs font-semibold text-white/80">
          {ROLE_LABELS[rol]}
        </p>
        <form action={async () => {
          await logout();
        }} className="mt-4">
          <button
            type="submit"
            className="w-full rounded-lg border border-white/40 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
          >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}

'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { establecerContrasena } from '@/app/actions/auth';
import type { AuthState } from '@/types/auth';

const claseCampo =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100';
const claseEtiqueta = 'mb-1 block text-sm font-medium text-slate-700';

export default function EstablecerContrasenaForm({
  correo,
}: {
  correo: string;
}) {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    establecerContrasena,
    {},
  );

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Acceso de equipo
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">
        Establece tu contraseña
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Tu correo fue verificado. Define una contraseña para entrar al panel de
        equipo.
      </p>

      {correo ? (
        <p className="mt-4 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-600">
          Cuenta: <span className="font-medium text-slate-800">{correo}</span>
        </p>
      ) : null}

      {state.error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          {state.error}
        </p>
      ) : null}

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label className={claseEtiqueta} htmlFor="password">
            Nueva contraseña *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            disabled={pending}
            aria-invalid={Boolean(state.error)}
            aria-describedby="password-ayuda"
            className={claseCampo}
            placeholder="Mínimo 8 caracteres"
          />
          <p id="password-ayuda" className="mt-1 text-xs text-slate-500">
            Usa al menos 8 caracteres.
          </p>
        </div>

        <div>
          <label className={claseEtiqueta} htmlFor="confirmPassword">
            Confirmar contraseña *
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            disabled={pending}
            aria-invalid={Boolean(state.error)}
            className={claseCampo}
            placeholder="Repite tu contraseña"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        ¿Ya tienes contraseña?{' '}
        <Link
          href="/equipo/login"
          className="font-semibold text-[var(--color-primary)] hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}

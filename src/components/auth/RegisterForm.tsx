'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { registerAsistente } from '@/app/actions/auth';
import type { RegisterState } from '@/types/auth';

const inputClassName =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20';

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerAsistente,
    {},
  );

  if (state.success) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">¡Casi listo!</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{state.success}</p>
        <Link
          href="/login/asistente"
          className="mt-6 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary)]"
        >
          Ir al acceso de asistentes
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Nueva cuenta
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Registro de asistentes</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Crea tu cuenta para inscribirte y consultar tus eventos.
      </p>

      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="nombre" className="text-sm font-medium text-gray-800">
            Nombre completo
          </label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            autoComplete="name"
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="email" className="text-sm font-medium text-gray-800">
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="password" className="text-sm font-medium text-gray-800">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClassName}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
            className={inputClassName}
          />
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login/asistente"
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}

'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import type { AuthState } from '@/types/auth';

type Props = {
  action: (state: AuthState, formData: FormData) => Promise<AuthState>;
  next?: string;
  eyebrow: string;
  title: string;
  description: string;
  alternateHref: string;
  alternateLabel: string;
  registerHref?: string;
};

const inputClassName =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20';

export default function LoginForm({
  action,
  next = '',
  eyebrow,
  title,
  description,
  alternateHref,
  alternateLabel,
  registerHref,
}: Props) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        {eyebrow}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">{description}</p>

      <form action={formAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />

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
            placeholder="nombre@uanl.mx"
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
            autoComplete="current-password"
            required
            className={inputClassName}
            placeholder="••••••••"
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
          {pending ? 'Entrando…' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-6 space-y-2 border-t border-gray-100 pt-5 text-center text-sm">
        <Link
          href={alternateHref}
          className="block font-medium text-[var(--color-primary)] hover:underline"
        >
          {alternateLabel}
        </Link>
        {registerHref ? (
          <Link href={registerHref} className="block text-gray-600 hover:underline">
            ¿Aún no tienes cuenta? Regístrate como asistente
          </Link>
        ) : null}
      </div>
    </section>
  );
}

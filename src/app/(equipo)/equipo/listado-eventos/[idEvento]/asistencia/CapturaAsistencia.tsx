'use client';

import { useForm } from '@tanstack/react-form';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, type FormEvent } from 'react';

import { registrarAsistencia } from '@/app/actions/asistencia';

import PanelResultado from './PanelResultado';
import {
  esquemaCapturaPase,
  normalizarPase,
  type RespuestaAsistencia,
} from './schemas';

function primerError(errores: readonly unknown[]): string | null {
  for (const error of errores) {
    if (typeof error === 'string' && error.trim() !== '') return error;
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
  }
  return null;
}

export default function CapturaAsistencia({
  idEvento,
}: {
  idEvento: number;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const enviandoRef = useRef(false);
  const [respuesta, setRespuesta] = useState<RespuestaAsistencia | null>(null);
  const [pendiente, startTransition] = useTransition();

  const form = useForm({
    defaultValues: { pase: '' },
    validators: { onChange: esquemaCapturaPase },
    onSubmit: async ({ value }) => {
      const resultado = await registrarAsistencia(idEvento, value.pase);
      setRespuesta(resultado);

      form.reset();
      requestAnimationFrame(() => inputRef.current?.focus());

      if (resultado.ok && resultado.data.resultado === 'registrada') {
        startTransition(() => router.refresh());
      }
    },
  });

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (enviandoRef.current) return;

    enviandoRef.current = true;
    setRespuesta(null);
    startTransition(async () => {
      try {
        await form.handleSubmit();
      } finally {
        enviandoRef.current = false;
      }
    });
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">
        Registrar asistencia
      </h3>
      <p className="mt-1 text-sm text-slate-600">
        Lee o escribe el código del pase y presiona Enter.
      </p>

      <form onSubmit={enviar} noValidate className="mt-4">
        <form.Field name="pase">
          {(field) => {
            const error = primerError(field.state.meta.errors);
            return (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="sm:max-w-xs sm:flex-1">
                  <label className="mb-1 block text-sm font-medium text-slate-700" htmlFor="pase">
                    Código del pase
                  </label>
                  <input
                    ref={inputRef}
                    id="pase"
                    name={field.name}
                    value={field.state.value}
                    onChange={(evento) =>
                      field.handleChange(normalizarPase(evento.target.value))
                    }
                    onBlur={field.handleBlur}
                    maxLength={9}
                    autoComplete="off"
                    placeholder="039A-213B"
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'pase-error pase-hint' : 'pase-hint'}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 font-mono text-sm uppercase tracking-wider text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20"
                  />
                  <p id="pase-hint" className="mt-1 text-xs text-slate-500">
                    Formato XXXX-XXXX
                  </p>
                  {error ? (
                    <p
                      id="pase-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>

                <form.Subscribe selector={(state) => state.isSubmitting}>
                  {(isSubmitting) => (
                    <button
                      type="submit"
                      disabled={pendiente || isSubmitting}
                      className="mt-6 inline-flex items-center justify-center rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {pendiente || isSubmitting
                        ? 'Registrando…'
                        : 'Registrar asistencia'}
                    </button>
                  )}
                </form.Subscribe>
              </div>
            );
          }}
        </form.Field>

        <div role="status" aria-live="polite">
          <PanelResultado respuesta={respuesta} />
        </div>
      </form>
    </section>
  );
}

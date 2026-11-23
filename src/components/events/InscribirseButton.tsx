'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { inscribirseAction } from '@/app/eventos/actions';

type Mensaje = { tipo: 'ok' | 'error'; texto: string };

export default function InscribirseButton({
  idEvento,
  yaInscrito,
  disponible,
  label = 'Inscribirme a este evento',
  mensajeExito = 'Inscripción confirmada. Tu lugar quedó guardado.',
}: {
  idEvento: number;
  yaInscrito: boolean;
  disponible: boolean;
  label?: string;
  mensajeExito?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [mensaje, setMensaje] = useState<Mensaje | null>(null);
  const router = useRouter();

  if (yaInscrito) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">
        Ya tienes tu lugar reservado en este evento.
      </div>
    );
  }

  if (!disponible) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm font-medium text-gray-600">
        Este evento ya no está disponible para nuevas inscripciones.
      </div>
    );
  }

  function handleClick() {
    startTransition(async () => {
      const resultado = await inscribirseAction(idEvento);

      if (resultado.ok) {
        setMensaje({ tipo: 'ok', texto: mensajeExito });
        router.refresh();
      } else {
        setMensaje({ tipo: 'error', texto: resultado.message });
      }
    });
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex w-full items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 py-3.5 font-semibold text-white transition-colors hover:brightness-110 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {isPending ? 'Registrando…' : label}
      </button>

      {mensaje ? (
        <p
          role="status"
          className={`mt-3 rounded-xl border px-4 py-3 text-sm ${
            mensaje.tipo === 'ok'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {mensaje.texto}
        </p>
      ) : null}
    </div>
  );
}

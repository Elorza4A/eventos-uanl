'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

import { cancelarInscripcionAction } from '@/app/(protected)/mis-eventos/actions';

export default function CancelarInscripcionButton({
  idEvento,
  nombreEvento,
}: {
  idEvento: number;
  nombreEvento: string;
}) {
  const [confirmando, setConfirmando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function cancelar() {
    setError(null);
    startTransition(async () => {
      const resultado = await cancelarInscripcionAction(idEvento);
      if (resultado.ok) {
        router.refresh();
        return;
      }
      setError(resultado.message);
    });
  }

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="inline-flex w-full items-center justify-center rounded-xl border border-rose-200 bg-white px-5 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:outline-none"
      >
        Cancelar inscripción
      </button>
    );
  }

  return (
    <div
      role="group"
      aria-label="Confirmar cancelación de inscripción"
      className="rounded-xl border border-amber-200 bg-amber-50 p-4"
    >
      <p className="text-sm font-semibold text-amber-900">
        ¿Cancelar tu inscripción a {nombreEvento}?
      </p>
      <p className="mt-1 text-xs leading-relaxed text-amber-800">
        Tu lugar quedará disponible. Solo puedes cancelar hasta el día anterior al evento.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={cancelar}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? 'Cancelando…' : 'Sí, cancelar inscripción'}
        </button>
        <button
          type="button"
          onClick={() => {
            setConfirmando(false);
            setError(null);
          }}
          disabled={isPending}
          className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-900 transition-colors hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Conservar inscripción
        </button>
      </div>
      {error ? (
        <p role="alert" className="mt-3 text-sm font-medium text-rose-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}

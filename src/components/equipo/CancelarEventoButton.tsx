'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { cancelarEvento } from '@/app/actions/eventos';
import Toast from '@/components/ui/Toast';

export default function CancelarEventoButton({
  idEvento,
}: {
  idEvento: number;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const cerrarAviso = useCallback(() => setAviso(null), []);

  function confirmar() {
    setError(null);
    startTransition(async () => {
      const resultado = await cancelarEvento(idEvento);
      if (!resultado.ok) {
        setError(resultado.error);
        return;
      }

      setAbierto(false);
      setAviso('Evento cancelado');
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setAbierto(true);
        }}
        className="inline-flex items-center justify-center rounded-lg border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
      >
        Cancelar evento
      </button>

      {abierto ? (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 px-4"
          onKeyDown={(evento) => {
            if (evento.key === 'Escape' && !pendiente) setAbierto(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="cancelar-evento-titulo"
            aria-describedby="cancelar-evento-descripcion"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h3
              id="cancelar-evento-titulo"
              className="text-lg font-bold text-gray-900"
            >
              ¿Cancelar este evento?
            </h3>
            <p
              id="cancelar-evento-descripcion"
              className="mt-2 text-sm leading-relaxed text-slate-600"
            >
              Esta acción no se puede deshacer. Una vez cancelado, el evento no
              podrá reactivarse.
            </p>

            {error ? (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
              >
                {error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                autoFocus
                disabled={pendiente}
                onClick={() => setAbierto(false)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Volver
              </button>
              <button
                type="button"
                disabled={pendiente}
                onClick={confirmar}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendiente ? 'Cancelando…' : 'Sí, cancelar evento'}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <Toast
        key={aviso ?? 'sin-aviso'}
        mensaje={aviso}
        onClose={cerrarAviso}
      />
    </>
  );
}

'use client';

import { useEffect, useState } from 'react';

type Props = {
  mensaje: string | null;
  tipo?: 'exito' | 'error';
  onClose?: () => void;
  duracionMs?: number;
};

export default function Toast({
  mensaje,
  tipo = 'exito',
  onClose,
  duracionMs = 4500,
}: Props) {
  const [visible, setVisible] = useState(Boolean(mensaje));

  useEffect(() => {
    if (!mensaje) return;

    const temporizador = window.setTimeout(() => {
      setVisible(false);
      onClose?.();
    }, duracionMs);

    return () => window.clearTimeout(temporizador);
  }, [mensaje, duracionMs, onClose]);

  if (!visible || !mensaje) return null;

  const esError = tipo === 'error';

  return (
    <div
      role={esError ? 'alert' : 'status'}
      aria-live={esError ? 'assertive' : 'polite'}
      className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
        esError ? 'bg-rose-700' : 'bg-[var(--color-navy)]'
      }`}
    >
      <span
        aria-hidden="true"
        className={esError ? 'text-rose-200' : 'text-[var(--color-accent)]'}
      >
        {esError ? '!' : '✓'}
      </span>
      <span className="flex-1">{mensaje}</span>
      <button
        type="button"
        onClick={() => {
          setVisible(false);
          onClose?.();
        }}
        aria-label="Cerrar aviso"
        className="rounded p-0.5 text-white/80 transition hover:bg-white/10 hover:text-white"
      >
        ×
      </button>
    </div>
  );
}

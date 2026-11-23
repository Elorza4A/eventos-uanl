'use client';

import { useEffect, useState } from 'react';

type Props = {
  mensaje: string | null;
  onClose?: () => void;
  duracionMs?: number;
};

export default function Toast({
  mensaje,
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

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl bg-[var(--color-navy)] px-4 py-3 text-sm font-medium text-white shadow-lg"
    >
      <span aria-hidden="true" className="text-[var(--color-accent)]">
        ✓
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

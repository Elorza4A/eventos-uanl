'use client';

import { useCallback, useState, useTransition } from 'react';

import { logout } from '@/app/actions/auth';
import Toast from '@/components/ui/Toast';

type Props = {
  className?: string;
};

export default function LogoutButton({ className }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const cerrarError = useCallback(() => setError(null), []);

  function cerrarSesion() {
    setError(null);
    startTransition(async () => {
      const resultado = await logout();
      if (resultado?.error) setError(resultado.error);
    });
  }

  return (
    <>
      <button
        type="button"
        disabled={pendiente}
        onClick={cerrarSesion}
        className={`${className ??
          'rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100'} disabled:cursor-not-allowed disabled:opacity-60`}
      >
        {pendiente ? 'Cerrando sesión…' : 'Cerrar sesión'}
      </button>
      <Toast
        key={error ?? 'sin-error'}
        mensaje={error}
        tipo="error"
        onClose={cerrarError}
      />
    </>
  );
}

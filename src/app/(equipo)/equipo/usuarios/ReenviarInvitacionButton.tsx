'use client';

import { useEffect, useState } from 'react';

import { reenviarInvitacion } from '@/app/actions/usuarios';
import type { ResultadoUsuarioEquipo } from '@/types/usuarios-equipo';

type Props = {
  idAdministrador: number;
  nombre: string;
  correo: string;
  onResultado: (resultado: ResultadoUsuarioEquipo, correo: string) => void;
};

const SEGUNDOS_ESPERA = 60;
const ERROR_GENERICO =
  'No se pudo completar la invitación. Intenta de nuevo.';

export default function ReenviarInvitacionButton({
  idAdministrador,
  nombre,
  correo,
  onResultado,
}: Props) {
  const [pendiente, setPendiente] = useState(false);
  const [segundos, setSegundos] = useState(0);
  const esperando = segundos > 0;

  useEffect(() => {
    if (!esperando) return;

    const temporizador = window.setInterval(() => {
      setSegundos((actual) => Math.max(0, actual - 1));
    }, 1000);

    return () => window.clearInterval(temporizador);
  }, [esperando]);

  async function reenviar() {
    if (pendiente || esperando) return;
    setPendiente(true);

    try {
      const resultado = await reenviarInvitacion(idAdministrador);
      if (resultado.ok) setSegundos(SEGUNDOS_ESPERA);
      onResultado(resultado, correo);
    } catch {
      onResultado({ ok: false, error: ERROR_GENERICO }, correo);
    } finally {
      setPendiente(false);
    }
  }

  const etiqueta = pendiente
    ? 'Enviando…'
    : esperando
      ? `Reenviar en ${segundos} s`
      : 'Reenviar invitación';

  const ariaLabel = esperando
    ? `Reenviar invitación a ${nombre}. Disponible en ${segundos} segundos`
    : `Reenviar invitación a ${nombre}`;

  return (
    <button
      type="button"
      onClick={reenviar}
      disabled={pendiente || esperando}
      aria-label={ariaLabel}
      className="whitespace-nowrap rounded-lg border border-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)] transition enabled:hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
    >
      {etiqueta}
    </button>
  );
}

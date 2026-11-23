'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

/** Genera el QR con los datos que el organizador necesita para confirmar la asistencia. */
export default function CodigoQrAlumno({
  valor,
  tamano = 132,
}: {
  valor: string;
  tamano?: number;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let activo = true;

    QRCode.toDataURL(valor, {
      width: tamano,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: { dark: '#021f54', light: '#ffffff' },
    })
      .then((url) => {
        if (activo) {
          setDataUrl(url);
          setError(false);
        }
      })
      .catch(() => {
        if (activo) setError(true);
      });

    return () => {
      activo = false;
    };
  }, [valor, tamano]);

  if (error) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 p-3 text-center text-xs text-rose-700"
        style={{ width: tamano, height: tamano }}
        role="alert"
      >
        No se pudo generar el QR
      </div>
    );
  }

  if (!dataUrl) {
    return (
      <div
        className="flex shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-slate-500"
        style={{ width: tamano, height: tamano }}
      >
        Generando QR…
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={dataUrl}
      alt="Código QR con los datos del alumno y de su inscripción"
      width={tamano}
      height={tamano}
      className="shrink-0 rounded-lg border border-gray-200 bg-white p-1"
    />
  );
}

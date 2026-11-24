'use client';

import type { RespuestaAsistencia } from './schemas';
import { formatearFechaAsistencia } from './formato';

type Props = {
  respuesta: RespuestaAsistencia | null;
};

function Caja({
  tono,
  icono,
  titulo,
  detalle,
}: {
  tono: 'exito' | 'advertencia' | 'error';
  icono: string;
  titulo: string;
  detalle?: string;
}) {
  const estilos = {
    exito: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    advertencia: 'border-amber-200 bg-amber-50 text-amber-800',
    error: 'border-rose-200 bg-rose-50 text-rose-800',
  }[tono];

  return (
    <div className={`mt-4 flex gap-3 rounded-lg border px-4 py-3 text-sm ${estilos}`}>
      <span aria-hidden="true" className="text-base leading-5">
        {icono}
      </span>
      <div>
        <p className="font-semibold">{titulo}</p>
        {detalle ? <p className="mt-0.5 leading-relaxed">{detalle}</p> : null}
      </div>
    </div>
  );
}

export default function PanelResultado({ respuesta }: Props) {
  if (!respuesta) return null;

  if (!respuesta.ok) {
    return (
      <Caja
        tono="error"
        icono="✕"
        titulo="No se pudo registrar la asistencia"
        detalle={respuesta.error}
      />
    );
  }

  const data = respuesta.data;

  switch (data.resultado) {
    case 'registrada':
      return (
        <Caja
          tono="exito"
          icono="✓"
          titulo="Asistencia registrada"
          detalle={`${data.asistente.nombre} · ${data.asistente.tipo} · Facultad: ${
            data.asistente.facultad ?? 'Externo'
          } · ${formatearFechaAsistencia(data.fecha_asistencia)}`}
        />
      );
    case 'ya_registrada':
      return (
        <Caja
          tono="advertencia"
          icono="!"
          titulo="Este asistente ya registró su asistencia"
          detalle={`${data.asistente.nombre} · Registrada: ${formatearFechaAsistencia(
            data.fecha_asistencia,
          )}`}
        />
      );
    case 'no_inscrito':
      return (
        <Caja
          tono="error"
          icono="✕"
          titulo="Este asistente no está registrado en este evento"
          detalle={data.asistente.nombre}
        />
      );
    case 'inscripcion_cancelada':
      return (
        <Caja
          tono="error"
          icono="✕"
          titulo="Este asistente canceló su inscripción a este evento"
          detalle={data.asistente.nombre}
        />
      );
    case 'pase_invalido':
      return (
        <Caja
          tono="error"
          icono="✕"
          titulo="Código no válido: no existe ningún asistente con ese código"
        />
      );
    default:
      return null;
  }
}

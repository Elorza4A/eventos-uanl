import type { ResumenAsistencia as Resumen } from './schemas';

const formatearNumero = new Intl.NumberFormat('es-MX');

/** Floor evita mostrar 100 % cuando aún falta al menos un asistente. */
function calcularPorcentaje(parcial: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, Math.floor((parcial / total) * 100)));
}

type BarraProps = {
  titulo: string;
  texto: string;
  porcentaje: number;
  porcentajeDestacado?: string;
  nota?: string;
  etiqueta?: string;
  tono?: 'primario' | 'exito';
};

function Barra({
  titulo,
  texto,
  porcentaje,
  porcentajeDestacado,
  nota,
  etiqueta,
  tono = 'primario',
}: BarraProps) {
  const colorBarra =
    tono === 'exito'
      ? 'bg-emerald-500 dark:bg-emerald-400'
      : 'bg-[var(--color-primary)] dark:bg-blue-400';

  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-700 dark:bg-slate-800/50">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              {titulo}
            </h4>
            {etiqueta ? (
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30">
                {etiqueta}
              </span>
            ) : null}
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {texto}
          </p>
          {nota ? (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              {nota}
            </p>
          ) : null}
        </div>

        {porcentajeDestacado ? (
          <span
            aria-hidden="true"
            className="shrink-0 text-2xl font-bold tabular-nums text-[var(--color-primary)] dark:text-blue-300"
          >
            {porcentajeDestacado}
          </span>
        ) : null}
      </div>

      <div
        role="progressbar"
        aria-valuenow={porcentaje}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={nota ? `${texto}. ${nota}` : texto}
        aria-label={`${titulo}: ${texto}`}
        className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700"
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${colorBarra}`}
          style={{ width: `${porcentaje}%` }}
        />
      </div>
    </div>
  );
}

export default function ResumenAsistencia({ resumen }: { resumen: Resumen }) {
  const {
    cupo_maximo: cupo,
    inscritos,
    asistieron,
    canceladas,
  } = resumen;

  const porcentajeInscripcion = calcularPorcentaje(inscritos, cupo);
  const porcentajeAsistencia = calcularPorcentaje(asistieron, inscritos);
  const cupoLleno = cupo > 0 && inscritos >= cupo;

  const textoInscripcion =
    cupo > 0
      ? `Inscritos: ${formatearNumero.format(inscritos)} de ${formatearNumero.format(cupo)} (${porcentajeInscripcion} %)`
      : `Sin cupo definido · Inscritos: ${formatearNumero.format(inscritos)}`;

  const textoAsistencia =
    inscritos > 0
      ? `Asistencia registrada: ${formatearNumero.format(asistieron)} de ${formatearNumero.format(inscritos)} inscritos (${porcentajeAsistencia} %)`
      : `Asistencia registrada: ${formatearNumero.format(asistieron)} de ${formatearNumero.format(inscritos)} inscritos (—)`;

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">
          Resumen de asistencia
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Inscripción y asistencia del evento
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Barra
          titulo="Inscripción"
          texto={textoInscripcion}
          porcentaje={porcentajeInscripcion}
          etiqueta={cupoLleno ? 'Cupo lleno' : undefined}
        />
        <Barra
          titulo="Asistencia"
          texto={textoAsistencia}
          porcentaje={porcentajeAsistencia}
          porcentajeDestacado={
            inscritos > 0 ? `${porcentajeAsistencia} %` : '—'
          }
          nota={inscritos === 0 ? 'Aún no hay inscritos' : undefined}
          tono="exito"
        />
      </div>

      {canceladas > 0 ? (
        <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
          {formatearNumero.format(canceladas)} inscripciones canceladas (no se
          cuentan)
        </p>
      ) : null}
    </section>
  );
}

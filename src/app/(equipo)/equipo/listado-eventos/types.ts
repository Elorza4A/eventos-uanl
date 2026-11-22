export const ESTATUS_EVENTO = [
  'Activo',
  'En curso',
  'Cancelado',
  'Finalizado',
] as const;

export type EstatusEvento = (typeof ESTATUS_EVENTO)[number];

/** Fila serializable que consume la tabla cliente. */
export type EventoFila = {
  idEvento: number;
  nombreEvento: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  cupoMaximo: number | null;
  idDependencia: number | null;
  dependencia: string;
  organizador: string;
  estatus: EstatusEvento;
};

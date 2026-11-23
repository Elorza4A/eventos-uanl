import type { EstatusEvento } from '@/app/(equipo)/equipo/listado-eventos/types';

export type ResultadoCrearEvento =
  | { ok: true; idEvento: number }
  | { ok: false; error: string };

export type ResultadoCancelarEvento =
  | { ok: true }
  | { ok: false; error: string };

export type DependenciaOpcion = {
  idDependencia: number;
  nombreDependencia: string;
};

export type DetalleEvento = {
  idEvento: number;
  nombreEvento: string;
  descripcion: string | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  direccion: string | null;
  imagenUrl: string | null;
  cupoMaximo: number | null;
  fechaCreacion: string | null;
  idAdministrador: number | null;
  idDependencia: number | null;
  dependencia: string;
  organizador: string;
  estatusGuardado: string | null;
  estatus: EstatusEvento;
};

export type EventoParaCancelacion = {
  idEvento: number;
  idAdministrador: number | null;
  idDependencia: number | null;
  fechaInicio: string | null;
  fechaFin: string | null;
  estatusGuardado: string | null;
};

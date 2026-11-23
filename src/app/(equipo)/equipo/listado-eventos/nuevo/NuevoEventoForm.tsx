'use client';

import { useForm } from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { crearEvento } from '@/app/actions/eventos';
import { fechaDesdeLocal, fechaHoraLocal } from '@/lib/fechas-evento';
import {
  esquemaEvento,
  esquemaEventoBase,
  type ValoresEvento,
} from '@/lib/validations/evento';
import type { DependenciaOpcion } from '@/types/eventos';

type Props = {
  dependencias: DependenciaOpcion[];
  idDependencia: number;
  nombreOrganizador: string;
};

const valoresIniciales: ValoresEvento = {
  nombre_evento: '',
  descripcion_evento: '',
  dia_evento: '',
  hora_inicio: '',
  hora_fin: '',
  direccion_evento: '',
  imagen_url: '',
  cupo_maximo: '',
};

function primerError(errores: readonly unknown[]): string | null {
  for (const error of errores) {
    if (typeof error === 'string' && error.trim() !== '') return error;
    if (
      error &&
      typeof error === 'object' &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
  }
  return null;
}

const claseCampo =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
const claseEtiqueta = 'mb-1 block text-sm font-medium text-slate-700';

export default function NuevoEventoForm({
  dependencias,
  idDependencia,
  nombreOrganizador,
}: Props) {
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const opciones = dependencias.some(
    (dependencia) => dependencia.idDependencia === idDependencia,
  )
    ? dependencias
    : [
        {
          idDependencia,
          nombreDependencia: 'Dependencia del organizador',
        },
        ...dependencias,
      ];

  const form = useForm({
    defaultValues: valoresIniciales,
    validators: { onChange: esquemaEvento },
    onSubmitInvalid: ({ value }) => {
      const validacion = esquemaEvento.safeParse(value);
      const campo = validacion.success
        ? undefined
        : validacion.error.issues[0]?.path?.[0];

      if (typeof campo === 'string') {
        requestAnimationFrame(() => document.getElementById(campo)?.focus());
      }
    },
    onSubmit: async ({ value }) => {
      setErrorGeneral(null);
      const resultado = await crearEvento(value);

      if (!resultado.ok) {
        setErrorGeneral(resultado.error);
        return;
      }

      router.push(
        `/equipo/listado-eventos/${resultado.idEvento}/informacion-general?creado=1`,
      );
    },
  });

  function enviar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    startTransition(async () => {
      await form.handleSubmit();
    });
  }

  return (
    <form onSubmit={enviar} noValidate className="space-y-6">
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-gray-900">
          Datos registrados automáticamente
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className={claseEtiqueta} htmlFor="organizador-evento">
              Organizador
            </label>
            <input
              id="organizador-evento"
              value={nombreOrganizador}
              disabled
              className={claseCampo}
            />
          </div>
          <div>
            <label className={claseEtiqueta} htmlFor="fecha-creacion-evento">
              Fecha de creación
            </label>
            <input
              id="fecha-creacion-evento"
              value="Se registra automáticamente al guardar"
              disabled
              className={claseCampo}
            />
          </div>
          <div>
            <label className={claseEtiqueta} htmlFor="estatus-evento">
              Estatus
            </label>
            <input
              id="estatus-evento"
              value="Activo"
              disabled
              className={claseCampo}
            />
          </div>
          <div>
            <label className={claseEtiqueta} htmlFor="dependencia-evento">
              Dependencia
            </label>
            <select
              id="dependencia-evento"
              value={idDependencia}
              disabled
              className={claseCampo}
            >
              {opciones.map((dependencia) => (
                <option
                  key={dependencia.idDependencia}
                  value={dependencia.idDependencia}
                >
                  {dependencia.nombreDependencia}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Información del evento
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            * los campos con asterisco son obligatorios
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <form.Field name="nombre_evento">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div className="lg:col-span-2">
                  <label className={claseEtiqueta} htmlFor="nombre_evento">
                    Nombre del evento *
                  </label>
                  <input
                    id="nombre_evento"
                    name={field.name}
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    maxLength={180}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'nombre_evento-error' : undefined}
                    className={claseCampo}
                    placeholder="Nombre del evento"
                  />
                  {error ? (
                    <p
                      id="nombre_evento-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="descripcion_evento">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div className="lg:col-span-2">
                  <label className={claseEtiqueta} htmlFor="descripcion_evento">
                    Descripción *
                  </label>
                  <textarea
                    id="descripcion_evento"
                    name={field.name}
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    rows={4}
                    maxLength={2000}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'descripcion_evento-error' : undefined}
                    className={claseCampo}
                    placeholder="Descripción del evento"
                  />
                  {error ? (
                    <p
                      id="descripcion_evento-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="dia_evento">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div>
                  <label className={claseEtiqueta} htmlFor="dia_evento">
                    Día del evento *
                  </label>
                  <input
                    id="dia_evento"
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'dia_evento-error' : undefined}
                    className={claseCampo}
                  />
                  {error ? (
                    <p
                      id="dia_evento-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="hora_inicio">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div>
                  <label className={claseEtiqueta} htmlFor="hora_inicio">
                    Hora inicio *
                  </label>
                  <input
                    id="hora_inicio"
                    name={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'hora_inicio-error' : undefined}
                    className={claseCampo}
                  />
                  {error ? (
                    <p
                      id="hora_inicio-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field
            name="hora_fin"
            validators={{
              onChangeListenTo: ['dia_evento', 'hora_inicio'],
              onChange: ({ value, fieldApi }) => {
                const basico = esquemaEventoBase.shape.hora_fin.safeParse(value);
                if (!basico.success) {
                  return basico.error.issues[0]?.message ?? 'Hora no válida.';
                }

                const { dia_evento, hora_inicio } = fieldApi.form.state.values;
                const inicio = fechaDesdeLocal(fechaHoraLocal(dia_evento, hora_inicio));
                const fin = fechaDesdeLocal(fechaHoraLocal(dia_evento, value));
                if (inicio && fin && fin.getTime() <= inicio.getTime()) {
                  return 'La hora de fin debe ser posterior a la de inicio.';
                }
                return undefined;
              },
            }}
          >
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div>
                  <label className={claseEtiqueta} htmlFor="hora_fin">
                    Hora fin *
                  </label>
                  <input
                    id="hora_fin"
                    name={field.name}
                    type="time"
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'hora_fin-error' : undefined}
                    className={claseCampo}
                  />
                  {error ? (
                    <p
                      id="hora_fin-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="direccion_evento">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div className="lg:col-span-2">
                  <label className={claseEtiqueta} htmlFor="direccion_evento">
                    Dirección *
                  </label>
                  <textarea
                    id="direccion_evento"
                    name={field.name}
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    rows={2}
                    maxLength={300}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'direccion_evento-error' : undefined}
                    className={claseCampo}
                    placeholder="Dirección del evento"
                  />
                  {error ? (
                    <p
                      id="direccion_evento-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="imagen_url">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div className="lg:col-span-2">
                  <label className={claseEtiqueta} htmlFor="imagen_url">
                    URL de la imagen
                  </label>
                  <input
                    id="imagen_url"
                    name={field.name}
                    type="url"
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'imagen_url-error' : undefined}
                    className={claseCampo}
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                  {error ? (
                    <p
                      id="imagen_url-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>

          <form.Field name="cupo_maximo">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div>
                  <label className={claseEtiqueta} htmlFor="cupo_maximo">
                    Cupo máximo *
                  </label>
                  <input
                    id="cupo_maximo"
                    name={field.name}
                    type="number"
                    min={0}
                    max={1000}
                    step={1}
                    inputMode="numeric"
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    aria-invalid={Boolean(error)}
                    aria-describedby={
                      error ? 'cupo_maximo-error cupo_maximo-hint' : 'cupo_maximo-hint'
                    }
                    className={claseCampo}
                    placeholder="0"
                  />
                  <p id="cupo_maximo-hint" className="mt-1 text-xs text-slate-500">
                    Máximo 1000 asistentes.
                  </p>
                  {error ? (
                    <p
                      id="cupo_maximo-error"
                      role="alert"
                      className="mt-1 text-xs text-rose-600"
                    >
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
        </div>

        {errorGeneral ? (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
          >
            {errorGeneral}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-5">
          <Link
            href="/equipo/listado-eventos"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </Link>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <button
                type="submit"
                disabled={pendiente || isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--color-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {pendiente || isSubmitting ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
                    />
                    Guardando…
                  </>
                ) : (
                  'Guardar evento'
                )}
              </button>
            )}
          </form.Subscribe>
        </div>
      </section>
    </form>
  );
}

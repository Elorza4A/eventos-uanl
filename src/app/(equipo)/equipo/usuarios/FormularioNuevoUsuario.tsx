'use client';

import {
  useForm,
  type StandardSchemaV1,
} from '@tanstack/react-form';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useTransition, type FormEvent } from 'react';

import { crearAdministrador, crearOrganizador } from '@/app/actions/usuarios';
import {
  esquemaAdministrador,
  esquemaOrganizador,
  type ValoresUsuarioEquipo,
} from '@/lib/validations/usuario-equipo';
import type { DependenciaOpcion } from '@/types/eventos';

type Props = {
  rol: 'Administrador' | 'Organizador';
  dependencias: DependenciaOpcion[];
};

const valoresIniciales: ValoresUsuarioEquipo = {
  nombre: '',
  correo: '',
  id_dependencia: '',
};

const claseCampo =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500';
const claseEtiqueta = 'mb-1 block text-sm font-medium text-slate-700';
const claseError = 'mt-1 text-sm text-red-600';

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

/** Un único formulario para ambos roles; la dependencia solo aplica a Organizador. */
export default function FormularioNuevoUsuario({ rol, dependencias }: Props) {
  const router = useRouter();
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null);
  const [pendiente, startTransition] = useTransition();

  const esOrganizador = rol === 'Organizador';
  const esquemaActivo = esOrganizador
    ? esquemaOrganizador
    : esquemaAdministrador;
  const validador: StandardSchemaV1<ValoresUsuarioEquipo, unknown> =
    esquemaActivo;
  const lista = esOrganizador
    ? '/equipo/usuarios/organizador'
    : '/equipo/usuarios/administrador';

  const form = useForm({
    defaultValues: valoresIniciales,
    validators: { onChange: validador },
    onSubmitInvalid: ({ value }) => {
      const validacion = esquemaActivo.safeParse(value);
      const campo = validacion.success
        ? undefined
        : validacion.error.issues[0]?.path?.[0];

      if (typeof campo === 'string') {
        requestAnimationFrame(() => document.getElementById(campo)?.focus());
      }
    },
    onSubmit: async ({ value }) => {
      setErrorGeneral(null);
      const resultado = esOrganizador
        ? await crearOrganizador(value)
        : await crearAdministrador(value);

      if (!resultado.ok) {
        setErrorGeneral(resultado.error);
        return;
      }

      const correo = value.correo.trim().toLowerCase();
      router.push(`${lista}?invitacion=${encodeURIComponent(correo)}`);
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
      <section className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Datos del nuevo {rol.toLowerCase()}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Se enviará un correo al usuario para que verifique su cuenta y cree
            su contraseña. Después podrá iniciar sesión en el acceso de Equipo.
          </p>
          <p className="mt-1 text-xs text-slate-500">
            * los campos con asterisco son obligatorios
          </p>
        </div>

        <form.Field name="nombre">
          {(field) => {
            const error = primerError(field.state.meta.errors);
            return (
              <div>
                <label className={claseEtiqueta} htmlFor="nombre">
                  Nombre completo *
                </label>
                <input
                  id="nombre"
                  name={field.name}
                  type="text"
                  autoComplete="name"
                  maxLength={160}
                  value={field.state.value}
                  onChange={(evento) => field.handleChange(evento.target.value)}
                  onBlur={field.handleBlur}
                  disabled={pendiente}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'nombre-error' : undefined}
                  className={claseCampo}
                  placeholder="Nombre y apellidos"
                />
                {error ? (
                  <p id="nombre-error" className={claseError}>
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        <form.Field name="correo">
          {(field) => {
            const error = primerError(field.state.meta.errors);
            return (
              <div>
                <label className={claseEtiqueta} htmlFor="correo">
                  Correo electrónico *
                </label>
                <input
                  id="correo"
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  maxLength={255}
                  value={field.state.value}
                  onChange={(evento) => field.handleChange(evento.target.value)}
                  onBlur={field.handleBlur}
                  disabled={pendiente}
                  aria-invalid={Boolean(error)}
                  aria-describedby={error ? 'correo-error' : undefined}
                  className={claseCampo}
                  placeholder="nombre@correo.com"
                />
                {error ? (
                  <p id="correo-error" className={claseError}>
                    {error}
                  </p>
                ) : null}
              </div>
            );
          }}
        </form.Field>

        {esOrganizador ? (
          <form.Field name="id_dependencia">
            {(field) => {
              const error = primerError(field.state.meta.errors);
              return (
                <div>
                  <label className={claseEtiqueta} htmlFor="id_dependencia">
                    Dependencia *
                  </label>
                  <select
                    id="id_dependencia"
                    name={field.name}
                    value={field.state.value}
                    onChange={(evento) => field.handleChange(evento.target.value)}
                    onBlur={field.handleBlur}
                    disabled={pendiente}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? 'id_dependencia-error' : undefined}
                    className={claseCampo}
                  >
                    <option value="">Selecciona una dependencia</option>
                    {dependencias.map((dependencia) => (
                      <option
                        key={dependencia.idDependencia}
                        value={dependencia.idDependencia}
                      >
                        {dependencia.nombreDependencia}
                      </option>
                    ))}
                  </select>
                  {error ? (
                    <p id="id_dependencia-error" className={claseError}>
                      {error}
                    </p>
                  ) : null}
                </div>
              );
            }}
          </form.Field>
        ) : null}

        {errorGeneral ? (
          <p
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {errorGeneral}
          </p>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente ? 'Enviando…' : 'Enviar invitación'}
        </button>
        <Link
          href={lista}
          aria-disabled={pendiente}
          className={`rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 ${
            pendiente ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}

'use client';

import { startTransition, useActionState } from 'react';
import Link from 'next/link';
import { useForm, useStore } from '@tanstack/react-form';
import { z } from 'zod';

import { registerAsistente } from '@/app/actions/auth';
import {
  useEstados,
  useFacultades,
  useGeneros,
  useMunicipios,
} from '@/hooks/useCatalogos';
import type { RegisterState } from '@/types/auth';

const inputClassName =
  'mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-blue-500/20';
const errorClassName =
  'mt-1 text-sm text-rose-700';

type RegisterFormValues = {
  nombre: string;
  email: string;
  password: string;
  confirmPassword: string;
  estado: string;
  municipio: string;
  facultad: string;
  edad: string;
  genero: string;
};

const nombreSchema = z
  .string()
  .trim()
  .min(3, 'Ingresa tu nombre completo');
const emailSchema = z
  .string()
  .trim()
  .email('Ingresa un correo electrónico válido');
const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres');
const edadSchema = z
  .string()
  .refine(
    (value) =>
      value === '' ||
      (/^\d+$/.test(value) &&
        Number(value) >= 0 &&
        Number(value) <= 120),
    'Ingresa una edad válida entre 0 y 120',
  );

function getFieldError(error: unknown) {
  if (typeof error === 'string') return error;
  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message;
  }
  return 'Valor inválido';
}

export default function RegisterForm() {
  const [state, formAction, pending] = useActionState<RegisterState, FormData>(
    registerAsistente,
    {},
  );
  const form = useForm({
    defaultValues: {
      nombre: '',
      email: '',
      password: '',
      confirmPassword: '',
      estado: '',
      municipio: '',
      facultad: '',
      edad: '',
      genero: '',
    } satisfies RegisterFormValues,
    onSubmit: ({ value }) => {
      const formData = new FormData();
      formData.set('nombre', value.nombre);
      formData.set('email', value.email);
      formData.set('password', value.password);
      formData.set('confirmPassword', value.confirmPassword);
      formData.set('estado', value.estado);
      formData.set('municipio', value.municipio);
      formData.set('facultad', value.facultad);
      formData.set('edad', value.edad);
      formData.set('genero', value.genero);
      startTransition(() => {
        formAction(formData);
      });
    },
  });
  const idEstadoSeleccionado = useStore(
    form.store,
    (state) =>
      state.values.estado ? Number(state.values.estado) : null,
  );
  const estadosQuery = useEstados();
  const municipiosQuery = useMunicipios(idEstadoSeleccionado);
  const facultadesQuery = useFacultades();
  const generosQuery = useGeneros();

  if (state.success) {
    return (
      <section className="rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-xl font-bold text-gray-900">¡Casi listo!</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">{state.success}</p>
        <Link
          href="/login/asistente"
          className="mt-6 inline-block rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--color-primary)]"
        >
          Ir al acceso de asistentes
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]">
        Crea tu cuenta
      </p>
      <h1 className="mt-1 text-2xl font-bold text-gray-900">Eventos UANL</h1>
      <p className="mt-2 text-sm leading-relaxed text-gray-600">
        Crea tu cuenta para inscribirte y consultar tus eventos.
      </p>

      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
        className="mt-6 space-y-4"
      >
        <form.Field
          name="nombre"
          validators={{
            onChange: nombreSchema,
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="nombre" className="text-sm font-medium text-gray-800">
                Nombre completo
              </label>
              <input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="name"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={field.state.meta.errors.length > 0 ? 'nombre-error' : undefined}
                className={inputClassName}
              />
              {field.state.meta.errors.length > 0 ? (
                <p id="nombre-error" role="alert" className={errorClassName}>
                  {getFieldError(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="email"
          validators={{
            onChange: emailSchema,
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-800">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={field.state.meta.errors.length > 0 ? 'email-error' : undefined}
                className={inputClassName}
              />
              {field.state.meta.errors.length > 0 ? (
                <p id="email-error" role="alert" className={errorClassName}>
                  {getFieldError(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: passwordSchema,
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-800">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={field.state.meta.errors.length > 0 ? 'password-error' : undefined}
                className={inputClassName}
              />
              {field.state.meta.errors.length > 0 ? (
                <p id="password-error" role="alert" className={errorClassName}>
                  {getFieldError(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <form.Field
          name="confirmPassword"
          validators={{
            onChangeListenTo: ['password'],
            onChange: ({ value, fieldApi }) =>
              value === fieldApi.form.state.values.password
                ? undefined
                : 'Las contraseñas no coinciden.',
          }}
        >
          {(field) => (
            <div>
              <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
                aria-describedby={
                  field.state.meta.errors.length > 0
                    ? 'confirmPassword-error'
                    : undefined
                }
                className={inputClassName}
              />
              {field.state.meta.errors.length > 0 ? (
                <p id="confirmPassword-error" role="alert" className={errorClassName}>
                  {getFieldError(field.state.meta.errors[0])}
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="estado">
            {(field) => (
              <div>
                <label htmlFor="estado" className="text-sm font-medium text-gray-800">
                  Estado
                </label>
                <select
                  id="estado"
                  name="estado"
                  value={field.state.value}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                    form.setFieldValue('municipio', '');
                  }}
                  disabled={estadosQuery.isPending}
                  className={inputClassName}
                >
                  <option value="">
                    {estadosQuery.isPending
                      ? 'Cargando estados…'
                      : 'Selecciona un estado'}
                  </option>
                  {estadosQuery.data?.map((estado) => (
                    <option key={estado.id_estado} value={estado.id_estado}>
                      {estado.nombre_estado}
                    </option>
                  ))}
                </select>
                {estadosQuery.isError ? (
                  <p role="alert" className={errorClassName}>
                    No fue posible cargar los estados.
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="municipio">
            {(field) => (
              <div>
                <label htmlFor="municipio" className="text-sm font-medium text-gray-800">
                  Municipio
                </label>
                <select
                  id="municipio"
                  name="municipio"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  disabled={
                    idEstadoSeleccionado === null || municipiosQuery.isPending
                  }
                  className={inputClassName}
                >
                  <option value="">
                    {!idEstadoSeleccionado
                      ? 'Primero selecciona un estado'
                      : municipiosQuery.isPending
                        ? 'Cargando municipios…'
                        : 'Selecciona un municipio'}
                  </option>
                  {municipiosQuery.data?.map((municipio) => (
                    <option
                      key={municipio.id_municipio}
                      value={municipio.id_municipio}
                    >
                      {municipio.nombre_municipio}
                    </option>
                  ))}
                </select>
                {municipiosQuery.isError ? (
                  <p role="alert" className={errorClassName}>
                    No fue posible cargar los municipios.
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="facultad">
            {(field) => (
              <div>
                <label htmlFor="facultad" className="text-sm font-medium text-gray-800">
                  Facultad
                </label>
                <select
                  id="facultad"
                  name="facultad"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  disabled={facultadesQuery.isPending}
                  className={inputClassName}
                >
                  <option value="">
                    {facultadesQuery.isPending
                      ? 'Cargando facultades…'
                      : 'Selecciona una facultad'}
                  </option>
                  {facultadesQuery.data?.map((facultad) => (
                    <option
                      key={facultad.id_facultad}
                      value={facultad.id_facultad}
                    >
                      {facultad.nombre_facultad}
                    </option>
                  ))}
                </select>
                {facultadesQuery.isError ? (
                  <p role="alert" className={errorClassName}>
                    No fue posible cargar las facultades.
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field
            name="edad"
            validators={{
              onChange: edadSchema,
            }}
          >
            {(field) => (
              <div>
                <label htmlFor="edad" className="text-sm font-medium text-gray-800">
                  Edad
                </label>
                <input
                  id="edad"
                  name="edad"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={120}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                  aria-describedby={field.state.meta.errors.length > 0 ? 'edad-error' : undefined}
                  className={inputClassName}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p id="edad-error" role="alert" className={errorClassName}>
                    {getFieldError(field.state.meta.errors[0])}
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="genero">
            {(field) => (
              <div className="sm:col-span-2">
                <label htmlFor="genero" className="text-sm font-medium text-gray-800">
                  Género
                </label>
                <select
                  id="genero"
                  name="genero"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  disabled={generosQuery.isPending}
                  className={inputClassName}
                >
                  <option value="">
                    {generosQuery.isPending
                      ? 'Cargando géneros…'
                      : 'Selecciona una opción'}
                  </option>
                  {generosQuery.data?.map((genero) => (
                    <option key={genero.id_genero} value={genero.id_genero}>
                      {genero.nombre_genero}
                    </option>
                  ))}
                </select>
                {generosQuery.isError ? (
                  <p role="alert" className={errorClassName}>
                    No fue posible cargar los géneros.
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
        </div>

        {state.error ? (
          <p
            role="alert"
            className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700"
          >
            {state.error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-lg bg-[var(--color-navy)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>

      <p className="mt-6 border-t border-gray-100 pt-5 text-center text-sm text-gray-600">
        ¿Ya tienes cuenta?{' '}
        <Link
          href="/login/asistente"
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          Inicia sesión
        </Link>
      </p>
    </section>
  );
}

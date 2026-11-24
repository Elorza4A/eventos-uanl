import { z } from 'zod';

export const esquemaCorreo = z
  .string()
  .trim()
  .min(1, 'El correo electrónico es obligatorio.')
  .max(255, 'El correo electrónico no puede superar 255 caracteres.')
  .email('Ingresa un correo electrónico válido.')
  .transform((valor) => valor.toLowerCase());

const base = z.object({
  nombre: z
    .string()
    .trim()
    .min(1, 'El nombre completo es obligatorio.')
    .max(160, 'El nombre completo no puede superar 160 caracteres.'),
  correo: esquemaCorreo,
});

/** El formulario siempre envía `id_dependencia`; para Administrador se ignora. */
export const esquemaAdministrador = base.extend({
  id_dependencia: z.string(),
});

export const esquemaOrganizador = base.extend({
  id_dependencia: z
    .string()
    .trim()
    .min(1, 'Selecciona una dependencia.')
    .regex(/^\d+$/, 'Selecciona una dependencia válida.')
    .transform((valor) => Number(valor)),
});

/** Valores tal como los maneja TanStack Form. */
export type ValoresUsuarioEquipo = {
  nombre: string;
  correo: string;
  id_dependencia: string;
};

export type AdministradorValidado = z.output<typeof esquemaAdministrador>;
export type OrganizadorValidado = z.output<typeof esquemaOrganizador>;

export type RolUsuarioEquipo = 'Administrador' | 'Organizador';

/** Respuesta de `listar_usuarios_equipo_uanl`, ya validada y serializable. */
export type UsuarioEquipoFila = {
  id_administrador: number;
  nombre_admin: string;
  correo_admin: string;
  id_dependencia: number | null;
  nombre_dependencia: string | null;
  verificado: boolean;
  invitado_en: string | null;
};

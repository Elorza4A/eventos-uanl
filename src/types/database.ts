/** Roles tal como viven en `roles_administradores.nombre_rol`. */
export type RolEquipo = 'Administrador' | 'Organizador';

/** Roles internos usados por el enrutamiento de la aplicación. */
export type RolInterno = 'admin' | 'organizador' | 'asistente';

export type PerfilEquipo = {
  rol: RolEquipo;
  rolInterno: Exclude<RolInterno, 'asistente'>;
  idAdministrador: number | null;
  idDependencia: number | null;
  nombre: string | null;
};

export type PerfilAsistente = {
  idAsistente: string;
  nombre: string | null;
  idPase: string | null;
  interno: boolean;
};

export type PerfilAuth = {
  user: { id: string; email: string } | null;
  equipo: PerfilEquipo | null;
  asistente: PerfilAsistente | null;
};

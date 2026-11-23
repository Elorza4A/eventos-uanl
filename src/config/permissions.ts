export const ROLES = ['asistente', 'organizador', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const ALL_ROLES: readonly Role[] = ROLES;
export const STAFF_ROLES: readonly Role[] = ['organizador', 'admin'];
export const ASSISTANT_ROLES: readonly Role[] = ['asistente'];

export const ROLE_LABELS: Record<Role, string> = {
  asistente: 'Asistente',
  organizador: 'Organizador',
  admin: 'Administrador',
};

export function isValidRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value);
}

export type NavLink = {
  name: string;
  href: string;
  roles: readonly Role[];
  alwaysVisible?: boolean;
};

// Visitantes: solo Inicio. Asistentes autenticados: Inicio, Eventos y Mis eventos.
export const NAV_LINKS: readonly NavLink[] = [
  { name: 'Inicio', href: '/', roles: ALL_ROLES, alwaysVisible: true },
  { name: 'Eventos', href: '/eventos', roles: ASSISTANT_ROLES },
  { name: 'Mis eventos', href: '/mis-eventos', roles: ASSISTANT_ROLES },
];

export type RouteRule = {
  pattern: RegExp;
  roles: readonly Role[];
  loginPath: string;
};

/** Reglas de acceso por prefijo. Si una ruta no aparece aquí, es pública. */
export const ROUTE_RULES: readonly RouteRule[] = [
  {
    pattern: /^\/inicio(?:\/|$)/,
    roles: ASSISTANT_ROLES,
    loginPath: '/login',
  },
  {
    pattern: /^\/mis-eventos(?:\/|$)/,
    roles: ASSISTANT_ROLES,
    loginPath: '/login',
  },
  {
    pattern: /^\/eventos(?:\/|$)/,
    roles: ASSISTANT_ROLES,
    loginPath: '/login',
  },
  {
    pattern: /^\/completar-perfil(?:\/|$)/,
    roles: ALL_ROLES,
    loginPath: '/login',
  },
  {
    pattern: /^\/equipo\/usuarios(?:\/|$)/,
    roles: ['admin'],
    loginPath: '/equipo/login',
  },
  {
    pattern: /^\/equipo(?:\/(?!login(?:\/|$))|$)/,
    roles: STAFF_ROLES,
    loginPath: '/equipo/login',
  },
  {
    pattern: /^\/listado-eventos(?:\/|$)/,
    roles: STAFF_ROLES,
    loginPath: '/equipo/login',
  },
  {
    pattern: /^\/organizador(?:\/|$)/,
    roles: STAFF_ROLES,
    loginPath: '/equipo/login',
  },
  {
    // Toda sección distinta de Inicio y de las páginas de acceso exige sesión.
    // Las reglas específicas van primero, así que cada portal conserva su login.
    pattern: /^\/(?!$|(?:login|registro|no-autorizado|auth\/callback)(?:\/|$)|equipo\/login(?:\/|$)).+$/,
    roles: ALL_ROLES,
    loginPath: '/login',
  },
];

export function getRouteRule(pathname: string): RouteRule | undefined {
  return ROUTE_RULES.find((rule) => rule.pattern.test(pathname));
}

export function canAccess(role: Role | undefined, pathname: string): boolean {
  const rule = getRouteRule(pathname);
  if (!rule) return true;
  return !!role && rule.roles.includes(role);
}

export function visibleLinks(role?: Role): NavLink[] {
  return NAV_LINKS.filter(
    (link) => link.alwaysVisible || (!!role && link.roles.includes(role)),
  );
}

export function getHomeForRole(role: Role): string {
  if (role === 'admin' || role === 'organizador') return '/equipo';
  return '/eventos';
}

export const LOGIN_PORTALS = {
  asistente: {
    roles: ['asistente'] as readonly Role[],
    label: 'asistentes',
  },
  equipo: {
    roles: STAFF_ROLES,
    label: 'equipo',
  },
} as const;

export type LoginPortal = keyof typeof LOGIN_PORTALS;

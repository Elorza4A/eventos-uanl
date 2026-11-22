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
  /** Se resuelve con getHomeForRole() según la sesión. */
  home?: boolean;
};

export const NAV_LINKS: readonly NavLink[] = [
  { name: 'Inicio', href: '/', roles: ALL_ROLES, alwaysVisible: true, home: true },
  { name: 'Eventos', href: '/eventos', roles: ALL_ROLES, alwaysVisible: true },
  { name: 'Mis eventos', href: '/inicio', roles: ASSISTANT_ROLES },
  { name: 'Listado de eventos', href: '/listado-eventos', roles: STAFF_ROLES },
  { name: 'Administración', href: '/admin', roles: ['admin'] },
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
    loginPath: '/login/asistente',
  },
  {
    pattern: /^\/equipo(?:\/|$)/,
    roles: STAFF_ROLES,
    loginPath: '/login/equipo',
  },
  {
    pattern: /^\/listado-eventos(?:\/|$)/,
    roles: STAFF_ROLES,
    loginPath: '/login/equipo',
  },
  {
    pattern: /^\/admin(?:\/|$)/,
    roles: ['admin'],
    loginPath: '/login/equipo',
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
  ).map((link) =>
    link.home ? { ...link, href: role ? getHomeForRole(role) : '/' } : link,
  );
}

export function getHomeForRole(role: Role): string {
  if (role === 'asistente') return '/inicio';
  return '/equipo/inicio';
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

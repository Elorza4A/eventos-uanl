export const ROLES = ['asistente', 'organizador', 'admin'] as const;

export type Role = (typeof ROLES)[number];

export const ALL_ROLES: readonly Role[] = ROLES;
export const STAFF_ROLES: readonly Role[] = ['organizador', 'admin'];
export const ASSISTANT_ROLES: readonly Role[] = ['asistente', 'admin'];

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

export const NAV_LINKS: readonly NavLink[] = [
  { name: 'Inicio', href: '/', roles: ALL_ROLES, alwaysVisible: true },
  { name: 'Eventos', href: '/eventos', roles: ALL_ROLES, alwaysVisible: true },
  { name: 'Mis eventos', href: '/mis-eventos', roles: ASSISTANT_ROLES },
  { name: 'Organizar', href: '/organizar', roles: STAFF_ROLES },
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
    pattern: /^\/mis-eventos(?:\/|$)/,
    roles: ASSISTANT_ROLES,
    loginPath: '/login/asistente',
  },
  {
    pattern: /^\/organizar(?:\/|$)/,
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
  );
}

export function getHomeForRole(role: Role): string {
  if (role === 'admin') return '/admin';
  if (role === 'organizador') return '/organizar';
  return '/mis-eventos';
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

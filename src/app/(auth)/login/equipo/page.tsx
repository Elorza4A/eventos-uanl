import { redirect } from 'next/navigation';

/** Ruta anterior: se conserva como alias de /equipo/login. */
export default async function LoginEquipoLegacyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : '';
  redirect(next ? `/equipo/login?next=${encodeURIComponent(next)}` : '/equipo/login');
}

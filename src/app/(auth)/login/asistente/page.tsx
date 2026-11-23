import { redirect } from 'next/navigation';

/** Ruta anterior: se conserva como alias de /login. */
export default async function LoginAsistenteLegacyPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : '';
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
}

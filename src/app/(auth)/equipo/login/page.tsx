import { redirect } from 'next/navigation';

import { loginEquipo } from '@/app/actions/auth';
import LoginForm from '@/components/auth/LoginForm';
import { getHomeForRole } from '@/config/permissions';
import { getCurrentUser } from '@/lib/dal';

export default async function LoginEquipoPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(getHomeForRole(user.rol));

  const params = await searchParams;
  const next = typeof params.next === 'string' ? params.next : '';

  return (
    <LoginForm
      action={loginEquipo}
      next={next}
      eyebrow="Acceso equipo"
      title="Panel de equipo"
      description="Acceso exclusivo para organizadores y administradores de eventos."
      alternateHref="/login"
      alternateLabel="¿Eres asistente? Accede aquí"
    />
  );
}

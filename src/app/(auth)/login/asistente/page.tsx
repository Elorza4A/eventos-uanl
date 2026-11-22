import { redirect } from 'next/navigation';
import { loginAsistente } from '@/app/actions/auth';
import LoginForm from '@/components/auth/LoginForm';
import { getHomeForRole } from '@/config/permissions';
import { getCurrentUser } from '@/lib/dal';

export default async function LoginAsistentePage({
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
      action={loginAsistente}
      next={next}
      eyebrow="Acceso asistentes"
      title="Bienvenido, asistente"
      description="Entra con tu cuenta para consultar tus eventos y inscripciones."
      alternateHref="/login/equipo"
      alternateLabel="¿Eres organizador o administrador? Accede aquí"
      registerHref="/registro"
    />
  );
}
